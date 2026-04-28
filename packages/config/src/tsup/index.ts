import fs from "node:fs";
import path from "node:path";

import { defineConfig, type Options } from "tsup";
import { z } from "zod";

/**
 * Build-time heuristics used by the presets to infer sensible defaults.
 */
const isCI = !!process.env["CI"];
const isProd = process.env["NODE_ENV"] === "production" || isCI;

const packageJsonSchema = z
  .object({
    dependencies: z.record(z.string(), z.string()).optional(),
    peerDependencies: z.record(z.string(), z.string()).optional(),
  })
  .loose();

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
export function browserBundlePreset(opts: Options = {}) {
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
export function functionsBundlePreset(opts: Options = {}) {
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
 * Creates a tsup configuration preset for distributable Node.js command-line tools.
 *
 * @remarks
 * This preset is intended for packages that expose one or more executable
 * `bin` entrypoints, optionally alongside a small programmatic API.
 *
 * The defaults optimize for predictable CLI distribution:
 *
 * - Emits ESM for modern Node.js runtimes.
 * - Targets Node 22 by default, matching the package baseline.
 * - Bundles dependencies into the output by default so release artifacts are
 *   portable and do not depend on a sibling `node_modules` tree.
 * - Disables code splitting so each executable entrypoint is a self-contained
 *   file.
 * - Disables source maps by default because CLI artifacts are often distributed
 *   outside the source repository. Consumers can opt in with
 *   `{ sourcemap: true }` for internal tooling or debuggable releases.
 * - Emits declaration files by default so packages that also export a
 *   programmatic API remain typed.
 *
 * Place a shebang such as `#!/usr/bin/env node` in the executable source file
 * itself. tsup/esbuild preserves that shebang in the generated JavaScript
 * without applying it to non-executable entries such as `src/index.ts`.
 *
 * By default, the preset builds `src/bin.ts` and also includes `src/index.ts`
 * when that file exists. Pass `entry` to use different executable names or
 * additional entrypoints.
 *
 * @param opts - Additional tsup options to override the preset defaults.
 * @returns Resolved configuration object that can be passed directly to the tsup CLI.
 * @public
 */
export function nodeCliBundlePreset(opts: Options = {}) {
  return defineConfig({
    treeshake: true,
    ...opts,
    bundle: opts.bundle ?? true,
    clean: opts.clean ?? true,
    dts: opts.dts ?? true,
    entry: opts.entry ?? defaultNodeCliEntry(),
    external: opts.external ?? [],
    format: opts.format ?? ["esm"],
    minify: opts.minify ?? false,
    platform: opts.platform ?? "node",
    skipNodeModulesBundle: opts.skipNodeModulesBundle ?? false,
    sourcemap: opts.sourcemap ?? false,
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
export function publicDualBundlePreset(opts: Options = {}) {
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
    const result = packageJsonSchema.safeParse(JSON.parse(pkgContent));

    const ext = new Set<string>(
      result.success
        ? [
            ...Object.keys(result.data.dependencies ?? {}),
            ...Object.keys(result.data.peerDependencies ?? {}),
          ]
        : [],
    );

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

function defaultNodeCliEntry(): Record<string, string> {
  const entry: Record<string, string> = {
    bin: "src/bin.ts",
  };

  if (fs.existsSync(path.join(process.cwd(), "src/index.ts"))) {
    entry["index"] = "src/index.ts";
  }

  return entry;
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
