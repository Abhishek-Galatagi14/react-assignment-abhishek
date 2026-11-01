import { useCallback, useEffect, useRef, useState } from "react";

const API = "https://picsum.photos/v2/list?page=";

// download_url points at the full-size original (thousands of px wide).
// Swap its trailing /width/height for a thumbnail size so the page stays fast.
const thumb = (url) => url.replace(/\/\d+\/\d+$/, "/200/130");

export default function App() {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState(false);
  const pageRef = useRef(1);
  const loadingRef = useRef(false);
  const sentinelRef = useRef(null);

  const loadMore = useCallback(async () => {
    if (loadingRef.current || !hasMore) return;
    loadingRef.current = true;
    setLoading(true);
    setError(false);
    try {
      const res = await fetch(API + pageRef.current);
      if (!res.ok) throw new Error(res.status);
      const data = await res.json();
      if (data.length === 0) {
        setHasMore(false); // a page with no data: stop
      } else {
        setPhotos((prev) => [...prev, ...data.map((p) => ({ ...p, likes: 0 }))]);
        pageRef.current += 1;
      }
    } catch {
      setError(true);
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  }, [hasMore]);

  // Load the next page whenever the bottom sentinel scrolls into view.
  // The observer is recreated after each page so it re-checks if the sentinel is still visible.
  useEffect(() => {
    const node = sentinelRef.current;
    if (!node) return;
    const observer = new IntersectionObserver(
      (entries) => entries[0].isIntersecting && loadMore(),
      { rootMargin: "300px" }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [loadMore, photos.length]);

  const like = (id) =>
    setPhotos((prev) => prev.map((p) => (p.id === id ? { ...p, likes: p.likes + 1 } : p)));

  return (
    <div className="gallery">
      <h1>Photo gallery</h1>

      <ul className="list">
        {photos.map((p) => (
          <li className="item" key={p.id}>
            <img src={thumb(p.download_url)} alt={`Photo by ${p.author}`} width="200" loading="lazy" />
            <span className="author">Author: {p.author}</span>
            <button className="thumb" onClick={() => like(p.id)} aria-label={`Like photo by ${p.author}`}>
              <i className="fa-solid fa-thumbs-up" aria-hidden="true" />
              <span className="count">{p.likes}</span>
            </button>
          </li>
        ))}
      </ul>

      <div ref={sentinelRef} className="status">
        {loading && "Loading…"}
        {error && (
          <>
            Couldn’t load photos. <button onClick={loadMore}>Try again</button>
          </>
        )}
        {!hasMore && photos.length > 0 && "No more photos."}
      </div>
    </div>
  );
}
