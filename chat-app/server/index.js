import express from "express";
import http from "http";
import { Server } from "socket.io";

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

const messages = []; // in-memory history

io.on("connection", (socket) => {
  socket.emit("chat:history", messages);

  // publish: a client sends a message, the server broadcasts it to every client (subscribe)
  socket.on("chat:message", (msg) => {
    const clean = {
      id: String(msg.id),
      user: String(msg.user).slice(0, 20),
      text: String(msg.text).slice(0, 1000),
      time: Date.now(),
      likes: 0,
    };
    messages.push(clean);
    io.emit("chat:message", clean);
  });

  socket.on("chat:like", (id) => {
    const m = messages.find((x) => x.id === id);
    if (!m) return;
    m.likes += 1;
    io.emit("chat:like", { id, likes: m.likes });
  });
});

const PORT = process.env.PORT || 4000;
server.listen(PORT, () => console.log(`Socket server on http://localhost:${PORT}`));
