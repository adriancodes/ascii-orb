import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  // Relative base so the built demo works at any subpath — including
  // https://<user>.github.io/ascii-orb/.
  base: "./",
  plugins: [react()],
  resolve: {
    // Point at library source so demo dev hot-reloads without a rebuild.
    alias: {
      "ascii-orb/core": path.resolve(__dirname, "../src/core.ts"),
      "ascii-orb": path.resolve(__dirname, "../src/index.ts")
    }
  }
});
