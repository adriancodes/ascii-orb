import { performance } from "node:perf_hooks";
import process from "node:process";
import console from "node:console";
import { resolve } from "node:path";
import { pathToFileURL } from "node:url";

const { renderOrbFrame } = await import(pathToFileURL(resolve(process.argv[2] ?? "dist/core.js")));
const variants = ["ion", "pulse", "rift", "veil", "sigil", "eclipse", "aether", "quasar",
  "abyss", "wraith", "lattice", "ember", "nova", "oracle", "void", "glacier"];

// One warmup and five measured passes through all variants at a fixed grid size.
for (const count of [0, 1, 5]) {
  const ripples = Array.from({ length: count }, (_, i) => ({
    id: i, x: (i - 2) * 0.15, y: i * 0.08, start: 0, duration: 1.9
  }));
  const samples = [];
  for (let run = 0; run < 6; run += 1) {
    const start = performance.now();
    for (let i = 0; i < 320; i += 1) {
      renderOrbFrame({ width: 96, height: 50, timeSeconds: 0.3 + i / 640,
        variant: variants[i % variants.length], ripples });
    }
    if (run) samples.push((performance.now() - start) / 320);
  }
  console.log(JSON.stringify({ ripples: count, msPerFrame: samples,
    median: [...samples].sort((a, b) => a - b)[2] }));
}
