import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    mode === 'development' && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    target: "es2022", // 👈 Enables top-level await
    rollupOptions: {
      onwarn(warning, warn) {
        // 👇 Silences "Use of eval" warnings (optional)
        if (warning.message.includes("Use of eval")) return;
        warn(warning);
      },
    },
  },
}));

