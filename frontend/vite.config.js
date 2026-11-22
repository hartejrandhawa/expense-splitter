import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Proxy API calls in dev so the browser talks to one origin (no CORS preflights).
    proxy: {
      "/api": "http://localhost:8080",
    },
  },
  test: {
    environment: "node",
  },
});
