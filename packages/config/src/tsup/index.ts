import { type Options, defineConfig } from "tsup";

export type PresetOptions = {
  entry?: Options["entry"];
  format?: Options["format"];
  dts?: Options["dts"];
  target?: Options["target"];
  external?: string[];
  platform?: Options["platform"];
  minify?: boolean;
  splitting?: boolean;
};

export function defineTsupPreset(opts: PresetOptions = {}) {
  return defineConfig({
    entry: opts.entry ?? { index: "src/index.ts" },
    format: opts.format ?? ["esm"],
    dts: opts.dts ?? true,
    sourcemap: true,
    clean: true,
    treeshake: true,
    minify: opts.minify ?? false,
    splitting: opts.splitting ?? false,
    target: opts.target ?? "es2022",
    external: opts.external ?? [],
    platform: opts.platform ?? "node",
  });
}

export const libraryPreset = (
  entry: Record<string, string> | undefined = { index: "src/index.ts" },
) => defineTsupPreset({ entry, format: ["esm"], dts: true });

export const dualFormatPreset = (
  entry: Record<string, string> | undefined = { index: "src/index.ts" },
) => defineTsupPreset({ entry, format: ["esm", "cjs"], dts: true });

export const multiEntryPreset = (entries: Record<string, string>) =>
  defineTsupPreset({ entry: entries, format: ["esm"], dts: true });
