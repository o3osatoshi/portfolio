import fs from "node:fs";
import path from "node:path";
import { type Options, defineConfig } from "tsup";

/**
 * Build-time heuristics
 */

// biome-ignore lint/complexity/useLiteralKeys: prioritize TS4111
const isCI = !!process.env["CI"];
// biome-ignore lint/complexity/useLiteralKeys: prioritize TS4111
const isProd = process.env["NODE_ENV"] === "production" || isCI;

/**
 * Defaults for consistent configuration
 */
const DEFAULTS = {
  target: "es2022",
  platform: "node",
  sourcemap: false,
  minify: false,
  clean: true,
} as const;

/**
 * Package.json structure for type safety
 */
interface PackageJson {
  dependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
  optionalDependencies?: Record<string, string>;
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
      ...Object.keys(pkg.optionalDependencies ?? {}),
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

function findNearestPackageJson(dir: string): string | null {
  let cur = dir;
  while (cur && cur !== path.dirname(cur)) {
    const p = path.join(cur, "package.json");
    if (fs.existsSync(p)) return p;
    cur = path.dirname(cur);
  }
  console.warn("No package.json found");
  return null;
}

/**
 * Shared defaults:
 * - ESM first
 * - tree-shaken, minimal out
 * - no sourcemap / no minify / no dts by default for monorepo-internal speed & size
 *   (override per-preset when publishing)
 */
export type PresetOptions = {
  entry?: Options["entry"];
  format?: Options["format"];
  dts?: boolean;
  target?: Options["target"];
  external?: Options["external"]; // allow string | RegExp
  platform?: Options["platform"];
  minify?: boolean;
  splitting?: boolean;
  sourcemap?: boolean;
  clean?: boolean;
  banner?: Options["banner"];
  env?: Options["env"];
  bundle?: Options["bundle"];
};

export async function defineTsupPreset(opts: PresetOptions = {}) {
  // Normalize commonly reused values
  const format = opts.format ?? ["esm"];

  const external: NonNullable<Options["external"]> = [
    ...autoExternals(),
    ...((opts.external ?? []) as NonNullable<Options["external"]>),
  ];

  return defineConfig({
    entry: opts.entry ?? { index: "src/index.ts" },
    format,
    dts: !!opts.dts,
    sourcemap: opts.sourcemap ?? DEFAULTS.sourcemap,
    clean: opts.clean ?? DEFAULTS.clean,
    treeshake: true,
    minify: opts.minify ?? DEFAULTS.minify,
    splitting:
      opts.splitting ?? (Array.isArray(format) && format.includes("esm")),
    target: opts.target ?? DEFAULTS.target,
    external,
    platform: opts.platform ?? DEFAULTS.platform,
    ...(opts.env ? { env: opts.env } : {}),
    // Pass banner directly to tsup; it forwards to esbuild as needed
    ...(opts.banner ? { banner: opts.banner } : {}),
    // Allow explicit bundle control when needed (e.g., Prisma preset)
    ...(typeof opts.bundle !== "undefined" ? { bundle: opts.bundle } : {}),
    // Fastest dev feedback
    ...(!isCI ? { onSuccess: "echo \u2705 tsup build finished" } : {}),
  });
}

/* ----------------------------- Presets ---------------------------------- */

/**
 * 1) Internal ESM library preset (monorepo-only)
 * - ESM only, no dts, no sourcemap, no minify
 * - fastest for day-to-day development
 */
export async function internalEsmPreset(
  entry: Record<string, string> | undefined = { index: "src/index.ts" },
) {
  return defineTsupPreset({
    entry,
    format: ["esm"],
    dts: false,
    splitting: true,
    // All other values use DEFAULTS
  });
}

/**
 * 2) Public library preset (dual format + DTS)
 * - ESM + CJS, DTS on, still treeshake
 * - sourcemap off by default (turn on if you really need it)
 */
export async function publicDualPreset(
  entry: Record<string, string> | undefined = { index: "src/index.ts" },
  withSourceMap = isProd,
) {
  return defineTsupPreset({
    entry,
    format: ["esm", "cjs"],
    dts: true,
    sourcemap: withSourceMap,
    minify: isProd, // minify on CI/production
    splitting: true,
    // target and platform use DEFAULTS
  });
}

/**
 * 3) React component preset (for packages/ui consumed by Next)
 * - ESM only, browser platform, React externals, DTS optional (usually not needed)
 * - preserve JSX transform via esbuild default; Next handles it later
 */
export async function browserPreset(
  entry: Record<string, string> | undefined = { index: "src/index.tsx" },
  options: { dts?: boolean } = {},
) {
  return defineTsupPreset({
    entry,
    format: ["esm"],
    dts: !!options.dts,
    platform: "browser",
    // React components should use consistent target
    target: DEFAULTS.target,
    // UI treats React/Next as externals (autoExternals also captures them; explicit for clarity)
    external: ["react", "react-dom", "next"],
  });
}

/**
 * 4) Node CLI preset
 * - CJS single-file output with shebang
 * - ideal for lightweight CLI tools
 */
export async function nodeCliPreset(
  entry: Record<string, string> | undefined = { cli: "src/cli.ts" },
) {
  return defineTsupPreset({
    entry,
    format: ["cjs"],
    dts: false,
    // CLI can use slightly older target for compatibility
    target: "es2020",
    minify: isProd,
    splitting: false,
    banner: { js: "#!/usr/bin/env node" },
  });
}

/**
 * 5) Prisma helper preset (no bundle, just transpile)
 * - Keep things simple; prisma often prefers Node runtime resolution
 */
export async function prismaPreset(
  entry: Record<string, string> | undefined = { index: "src/index.ts" },
) {
  return defineTsupPreset({
    entry,
    format: ["esm"],
    dts: false,
    // Prisma works better with slightly older target
    target: "es2020",
    splitting: false,
    bundle: false,
    // Prisma client is runtime-generated; keep it external always
    external: ["@prisma/client"],
  });
}

/**
 * 6) Multi-entry ESM preset (internal)
 * - For packages exposing multiple entry points but monorepo-only usage
 */
export async function multiEntryEsmPreset(entries: Record<string, string>) {
  return defineTsupPreset({
    entry: entries,
    format: ["esm"],
    dts: false,
    splitting: true,
    // All other values use DEFAULTS
  });
}

/**
 * 7) Firebase Functions preset (Node runtime, ESM output)
 * - ESM single-file output for Functions runtime
 * - Node platform, Node22 target, sourcemaps for debugging
 * - Bundle local code, externalize deps automatically (via autoExternals)
 */
export async function functionsPreset(
  entry: Record<string, string> | undefined = { index: "src/index.ts" },
) {
  return defineTsupPreset({
    entry,
    format: ["esm"],
    dts: false,
    platform: "node",
    target: "node22",
    minify: isProd,
    sourcemap: true,
    splitting: false,
  });
}
