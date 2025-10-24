import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  // If you need to deploy under a subpath (example.com/frontend/), set the
  // environment variable VITE_BASE to that path (for example: 
  // VITE_BASE=/frontend/). This keeps dev (vite server) working with '/' while
  // allowing production builds to target a subpath.
  base: process.env.VITE_BASE ?? '/',
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
