import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  resolve: {
    // Demo files import the package by name; point at source like the
    // demo's own vite config does.
    alias: {
      "ascii-orb/core": path.resolve(__dirname, "src/core.ts"),
      "ascii-orb": path.resolve(__dirname, "src/index.ts")
    }
  },
  test: {
    include: ["src/**/*.test.{ts,tsx}", "demo/src/**/*.test.{ts,tsx}"]
  }
});
