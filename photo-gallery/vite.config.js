import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// picsum.photos allows cross-origin requests, so no proxy is normally needed.
// If you ever hit a CORS error, requests to /picsum/... are proxied here:
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/picsum": {
        target: "https://picsum.photos",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/picsum/, ""),
      },
    },
  },
});
