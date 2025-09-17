import fs from "node:fs";
import path from "node:path";

import { defineConfig, type Options } from "tsup";

/**
 * Build-time heuristics
 */
const isCI = !!process.env["CI"];
const isProd = process.env["NODE_ENV"] === "production" || isCI;

/**
 * Package.json structure for type safety
 */
interface PackageJson {
  dependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
}

/**
 * 3) React component preset (for packages/ui consumed by Next)
 * - ESM only, browser platform, React externals, DTS optional (usually not needed)
 * - preserve JSX transform via esbuild default; Next handles it later
 */
export async function browserPreset(opts: Options = {}) {
  return defineConfig({
    treeshake: true,
    ...opts,
    clean: opts.clean ?? true,
    dts: opts.dts ?? false,
    entry: opts.entry ?? { index: "src/index.tsx" },
    external: [
      ...autoExternals(),
      "react",
      "react-dom",
      "next",
      ...((opts.external ?? []) as NonNullable<Options["external"]>),
    ],
    format: opts.format ?? ["esm"],
    minify: opts.minify ?? false,
    platform: opts.platform ?? "browser",
    sourcemap: opts.sourcemap ?? false,
    splitting: opts.splitting ?? true,
    target: opts.target ?? "es2022",
  });
}

/**
 * 7) Firebase Functions preset (Node runtime, ESM output)
 * - ESM single-file output for Functions runtime
 * - Node platform, Node22 target, sourcemaps for debugging
 * - Bundle local code, externalize deps automatically (via autoExternals)
 */
export async function functionsPreset(opts: Options = {}) {
  return defineConfig({
    treeshake: true,
    ...opts,
    clean: opts.clean ?? true,
    dts: opts.dts ?? false,
    entry: opts.entry ?? { index: "src/index.ts" },
    external: [
      ...autoExternals(),
      ...((opts.external ?? []) as NonNullable<Options["external"]>),
    ],
    format: opts.format ?? ["esm"],
    minify: opts.minify ?? isProd,
    platform: opts.platform ?? "node",
    sourcemap: opts.sourcemap ?? true,
    splitting: opts.splitting ?? false,
    target: opts.target ?? "node22",
  });
}

/* ----------------------------- Presets ---------------------------------- */

/**
 * 1) Internal ESM library preset (monorepo-only)
 * - ESM only, no dts, no sourcemap, no minify
 * - fastest for day-to-day development
 */
export async function internalEsmPreset(opts: Options = {}) {
  return defineConfig({
    treeshake: true,
    ...opts,
    clean: opts.clean ?? true,
    dts: opts.dts ?? false,
    entry: opts.entry ?? { index: "src/index.ts" },
    external: [
      ...autoExternals(),
      ...((opts.external ?? []) as NonNullable<Options["external"]>),
    ],
    format: opts.format ?? ["esm"],
    minify: opts.minify ?? false,
    platform: opts.platform ?? "node",
    sourcemap: opts.sourcemap ?? false,
    splitting: opts.splitting ?? true,
    target: opts.target ?? "es2022",
  });
}

/**
 * 6) Multi-entry ESM preset (internal)
 * - For packages exposing multiple entry points but monorepo-only usage
 */
export async function multiEntryEsmPreset(opts: Options = {}) {
  return defineConfig({
    treeshake: true,
    ...opts,
    clean: opts.clean ?? true,
    dts: opts.dts ?? false,
    entry: opts.entry ?? { index: "src/index.ts" },
    external: [
      ...autoExternals(),
      ...((opts.external ?? []) as NonNullable<Options["external"]>),
    ],
    format: opts.format ?? ["esm"],
    minify: opts.minify ?? false,
    platform: opts.platform ?? "node",
    sourcemap: opts.sourcemap ?? false,
    splitting: opts.splitting ?? true,
    target: opts.target ?? "es2022",
  });
}

/**
 * 4) Node CLI preset
 * - CJS single-file output with shebang
 * - ideal for lightweight CLI tools
 */
export async function nodeCliPreset(opts: Options = {}) {
  return defineConfig({
    treeshake: true,
    ...opts,
    banner: opts.banner ?? { js: "#!/usr/bin/env node" },
    clean: opts.clean ?? true,
    dts: opts.dts ?? false,
    entry: opts.entry ?? { cli: "src/cli.ts" },
    external: [
      ...autoExternals(),
      ...((opts.external ?? []) as NonNullable<Options["external"]>),
    ],
    format: opts.format ?? ["cjs"],
    minify: opts.minify ?? isProd,
    platform: opts.platform ?? "node",
    sourcemap: opts.sourcemap ?? false,
    splitting: opts.splitting ?? false,
    target: opts.target ?? "es2020",
  });
}

/**
 * 5) Prisma helper preset (no bundle, just transpile)
 * - Keep things simple; prisma often prefers Node runtime resolution
 */
export async function prismaPreset(opts: Options = {}) {
  return defineConfig({
    treeshake: true,
    ...opts,
    // Prisma prefers runtime resolution
    bundle: opts.bundle ?? false,
    clean: opts.clean ?? true,
    dts: opts.dts ?? false,
    entry: opts.entry ?? { index: "src/index.ts" },
    external: [
      ...autoExternals(),
      "@prisma/client",
      ...((opts.external ?? []) as NonNullable<Options["external"]>),
    ],
    format: opts.format ?? ["esm"],
    minify: opts.minify ?? false,
    platform: opts.platform ?? "node",
    sourcemap: opts.sourcemap ?? false,
    splitting: opts.splitting ?? false,
    target: opts.target ?? "es2020",
  });
}

/**
 * 2) Public library preset (dual format + DTS)
 * - ESM + CJS, DTS on, still treeshake
 * - sourcemap off by default (turn on if you really need it)
 */
export async function publicDualPreset(opts: Options = {}) {
  return defineConfig({
    treeshake: true,
    ...opts,
    clean: opts.clean ?? true,
    dts: opts.dts ?? true,
    entry: opts.entry ?? { index: "src/index.ts" },
    external: [
      ...autoExternals(),
      ...((opts.external ?? []) as NonNullable<Options["external"]>),
    ],
    format: opts.format ?? ["esm", "cjs"],
    minify: opts.minify ?? false,
    platform: opts.platform ?? "node",
    sourcemap: opts.sourcemap ?? isProd,
    splitting: opts.splitting ?? true,
    target: opts.target ?? "es2022",
  });
}

/**
 * Read package.json (closest upwards) and collect externals.
 * - externalize all deps and peerDeps to keep bundles tiny and fast
 */
function autoExternals(pkgDir = process.cwd()): string[] {
  try {
    const pkgPath = findNearestPackageJson(pkgDir);
    if (!pkgPath) return [];

    const pkgContent = fs.readFileSync(pkgPath, "utf8");
    const pkg = JSON.parse(pkgContent) as PackageJson;

    const ext = new Set<string>([
      ...Object.keys(pkg.dependencies ?? {}),
      ...Object.keys(pkg.peerDependencies ?? {}),
    ]);

    // Common always-externals for UI/libs (avoid double-bundling)
    const commonExternals = ["react", "react-dom", "next"];
    for (const lib of commonExternals) {
      ext.add(lib);
    }

    return [...ext];
  } catch (error) {
    console.warn(`Failed to read package.json from ${pkgDir}:`, error);
    return [];
  }
}

function findNearestPackageJson(dir: string): null | string {
  let cur = dir;
  while (cur && cur !== path.dirname(cur)) {
    const p = path.join(cur, "package.json");
    if (fs.existsSync(p)) return p;
    cur = path.dirname(cur);
  }
  console.warn("No package.json found");
  return null;
}
