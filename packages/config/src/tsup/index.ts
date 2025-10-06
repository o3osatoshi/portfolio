import fs from "node:fs";
import path from "node:path";

import { defineConfig, type Options } from "tsup";

/**
 * Build-time heuristics used by the presets to infer sensible defaults.
 */
const isCI = !!process.env["CI"];
const isProd = process.env["NODE_ENV"] === "production" || isCI;

/**
 * Minimal package.json representation used when loading externals.
 */
interface PackageJson {
  dependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
}

/**
 * Creates a tsup configuration preset tailored for browser-facing React bundles.
 *
 * @remarks
 * - Emits ESM output and automatically marks core React/Next dependencies as externals.
 * - Enables tree shaking and code splitting by default to keep bundle size small.
 *
 * @param opts - Additional tsup options to override the preset defaults.
 * @returns Resolved configuration object that can be passed directly to the tsup CLI.
 * @public
 */
export async function browserBundlePreset(opts: Options = {}) {
  return defineConfig({
    treeshake: true,
    ...opts,
    clean: opts.clean ?? true,
    dts: opts.dts ?? true,
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
 * Creates a tsup configuration preset for Firebase Cloud Functions deployments.
 *
 * @remarks
 * - Emits CommonJS output targeting Node 22 and includes sourcemaps for local debugging.
 * - Automatically externalizes dependencies declared in the nearest package.json to keep bundles slim.
 * - Bundles project code into a single file to match the Functions runtime expectations.
 *
 * @param opts - Additional tsup options to override the preset defaults.
 * @returns Resolved configuration object that can be passed directly to the tsup CLI.
 * @public
 */
export async function functionsBundlePreset(opts: Options = {}) {
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
    format: opts.format ?? ["cjs"],
    minify: opts.minify ?? isProd,
    platform: opts.platform ?? "node",
    sourcemap: opts.sourcemap ?? true,
    splitting: opts.splitting ?? false,
    target: opts.target ?? "node22",
  });
}

/**
 * Creates a tsup configuration preset for public libraries that need dual ESM/CJS outputs.
 *
 * @remarks
 * - Produces both ESM and CJS bundles alongside TypeScript declaration files.
 * - Disables sourcemaps during local development for speed, enabling them in CI/production.
 * - Automatically externalizes runtime and peer dependencies to avoid duplicate bundling.
 *
 * @param opts - Additional tsup options to override the preset defaults.
 * @returns Resolved configuration object that can be passed directly to the tsup CLI.
 * @public
 */
export async function publicDualBundlePreset(opts: Options = {}) {
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
 * Resolve package dependencies to mark them as externals in bundler configs.
 *
 * Reads the closest `package.json` upwards from the provided directory and
 * returns a de-duplicated list of dependency names (dependencies + peerDependencies).
 *
 * @param pkgDir - Directory to start searching from (defaults to `process.cwd`).
 * @returns Array of dependency names that should be treated as externals.
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

/**
 * Traverse upwards from a directory to locate the nearest `package.json` file.
 *
 * @param dir - Starting directory for the lookup.
 * @returns Absolute path to the located `package.json`, or `null` if none found.
 */
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
