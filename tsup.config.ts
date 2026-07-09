import { defineConfig } from "tsup";

export default defineConfig([
  {
    // Root entry: the React component surface. The "use client" banner keeps
    // Next.js App Router consumers working without a wrapper file.
    entry: { index: "src/index.ts" },
    format: ["esm", "cjs"],
    dts: true,
    sourcemap: true,
    clean: true,
    banner: { js: '"use client";' },
    external: ["react"]
  },
  {
    // /core entry: the headless engine — no React, no client directive, so
    // it stays usable in server components and plain Node.
    entry: { core: "src/core.ts" },
    format: ["esm", "cjs"],
    dts: true,
    sourcemap: true
  }
]);
