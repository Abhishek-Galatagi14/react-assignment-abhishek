import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

const user_list = ["Alan", "Bob", "Carol", "Dean", "Elin"];
const COLORS = {
  Alan: "#d9e26a",
  Bob: "#8ec5f0",
  Carol: "#f0a58e",
  Dean: "#b7a0e8",
  Elin: "#ee8f95",
  "Team Bot": "#dc4a55",
};
const EMOJIS = ["😀", "😂", "😍", "😎", "🙌", "👍", "👋", "🎉", "🔥", "💡", "🤔", "😅", "❤️", "🚀", "✅", "🙏"];
const SERVER_URL = import.meta.env.VITE_SOCKET_URL || "http://localhost:4000";

const WELCOME = {
  id: "welcome",
  user: "Team Bot",
  text: "Welcome to Team Chat. 👋 Send a message now to start chatting.",
  time: Date.now(),
  likes: 0,
};

const pickUser = () => user_list[Math.floor(Math.random() * user_list.length)];
const initials = (name) => name.replace(/[^A-Za-z ]/g, "").slice(0, 2).toUpperCase();
const clock = (t) =>
  new Date(t).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: false });

function MessageText({ text }) {
  return text.split(/(@\w+)/g).map((part, i) =>
    user_list.includes(part.slice(1)) && part.startsWith("@") ? (
      <span className="mention" key={i}>{part}</span>
    ) : (
      <span key={i}>{part}</span>
    )
  );
}

export default function App() {
  const [messages, setMessages] = useState([WELCOME]);
  const [text, setText] = useState("");
  const [live, setLive] = useState(false);
  const [showEmoji, setShowEmoji] = useState(false);
  const [mentionQuery, setMentionQuery] = useState(null);
  const socketRef = useRef(null);
  const inputRef = useRef(null);
  const endRef = useRef(null);

  // Stretch goal 3: socket.io. If the server isn't running the app still works locally.
  useEffect(() => {
    const socket = io(SERVER_URL, { reconnectionAttempts: 3, timeout: 2000 });
    socketRef.current = socket;
    socket.on("connect", () => setLive(true));
    socket.on("disconnect", () => setLive(false));
    socket.on("chat:history", (history) => setMessages([WELCOME, ...history]));
    socket.on("chat:message", (m) => setMessages((prev) => [...prev, m]));
    socket.on("chat:like", ({ id, likes }) =>
      setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, likes } : m)))
    );
    return () => socket.disconnect();
  }, []);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = () => {
    const body = text.trim();
    if (!body) return;
    const msg = { id: crypto.randomUUID(), user: pickUser(), text: body, time: Date.now(), likes: 0 };
    if (live) socketRef.current.emit("chat:message", msg);
    else setMessages((prev) => [...prev, msg]);
    setText("");
    setMentionQuery(null);
    setShowEmoji(false);
    inputRef.current?.focus();
  };

  const like = (id) => {
    if (live && id !== "welcome") socketRef.current.emit("chat:like", id);
    else setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, likes: m.likes + 1 } : m)));
  };

  // Stretch goal 2: typing "@" opens the user list
  const onChange = (e) => {
    const value = e.target.value;
    setText(value);
    const upToCursor = value.slice(0, e.target.selectionStart);
    const match = upToCursor.match(/(?:^|\s)@(\w*)$/);
    setMentionQuery(match ? match[1] : null);
  };

  const pickMention = (name) => {
    const cursor = inputRef.current.selectionStart;
    const before = text.slice(0, cursor).replace(/@(\w*)$/, `@${name} `);
    setText(before + text.slice(cursor));
    setMentionQuery(null);
    inputRef.current.focus();
  };

  // Stretch goal 1: emoji picker
  const addEmoji = (emoji) => {
    setText((t) => t + emoji);
    inputRef.current?.focus();
  };

  const suggestions =
    mentionQuery === null
      ? []
      : user_list.filter((u) => u.toLowerCase().startsWith(mentionQuery.toLowerCase()));

  return (
    <div className="chat">
      <header className="chat-header">
        <div>
          <h1>Introductions</h1>
          <p>This channel is for company wide chatter</p>
        </div>
        <span className={`status ${live ? "on" : ""}`}>{live ? "Live" : "Offline mode"}</span>
      </header>

      <main className="thread" aria-live="polite">
        {messages.map((m) => (
          <article className="message" key={m.id}>
            <div className="avatar" style={{ background: COLORS[m.user] }}>{initials(m.user)}</div>
            <div className="body">
              <div className="meta">
                <strong>{m.user}</strong>
                <time>{clock(m.time)}</time>
              </div>
              <div className="bubble">
                <p><MessageText text={m.text} /></p>
                <button
                  className={`like ${m.likes ? "liked" : ""}`}
                  onClick={() => like(m.id)}
                  aria-label={`Like message from ${m.user}`}
                >
                  <span aria-hidden="true">{m.likes ? "♥" : "♡"}</span>
                  <span className="count">{m.likes}</span>
                </button>
              </div>
            </div>
          </article>
        ))}
        <div ref={endRef} />
      </main>

      <footer className="composer">
        {suggestions.length > 0 && (
          <ul className="popover mentions" role="listbox">
            {suggestions.map((u) => (
              <li key={u}>
                <button onMouseDown={(e) => e.preventDefault()} onClick={() => pickMention(u)}>
                  <span className="dot" style={{ background: COLORS[u] }} />
                  {u}
                </button>
              </li>
            ))}
          </ul>
        )}
        {showEmoji && (
          <div className="popover emojis">
            {EMOJIS.map((e) => (
              <button key={e} onClick={() => addEmoji(e)}>{e}</button>
            ))}
          </div>
        )}
        <div className="input-row">
          <input
            ref={inputRef}
            value={text}
            onChange={onChange}
            onKeyDown={(e) => e.key === "Enter" && send()}
            placeholder="Type message"
            aria-label="Type message"
          />
          <button className="emoji-btn" onClick={() => setShowEmoji((s) => !s)} aria-label="Add emoji">😊</button>
          <button className="send" onClick={send} disabled={!text.trim()}>Send</button>
        </div>
      </footer>
    </div>
  );
}
