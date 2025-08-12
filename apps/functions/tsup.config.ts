import * as fs from "node:fs";
import { defineConfig } from "tsup";

const pkg = JSON.parse(fs.readFileSync("./package.json", "utf8"));

export default defineConfig({
  entry: ["src/index.ts"],
  outDir: "dist",
  target: "node22",
  platform: "node",
  sourcemap: true,
  clean: true,
  bundle: true,
  external: [...Object.keys(pkg.dependencies || {})],
  tsconfig: "tsconfig.json",
});
