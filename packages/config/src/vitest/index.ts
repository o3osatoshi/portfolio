import { defineConfig, type ViteUserConfig } from "vitest/config";
import type { InlineConfig } from "vitest/node";

/**
 * Supported overrides for the shared Vitest presets.
 *
 * Combines `InlineConfig` so consumers can forward common Vitest options while exposing a
 * `plugins` property mirroring `ViteUserConfig["plugins"]` for Vite/Vitest plugin registration.
 */
export type Options = {
  plugins?: ViteUserConfig["plugins"];
} & InlineConfig;

/**
 * Creates the shared Vitest configuration for workspace packages with consistent reporting defaults.
 *
 * @remarks
 * Applies workspace defaults for coverage and reporting while allowing consumers to forward
 * frequently customised {@link InlineConfig} fields.
 * - Coverage defaults to the `v8` provider and remains disabled unless `opts.coverage?.enabled` is set.
 * - Core exclusions are enforced, with any additional `opts.coverage?.exclude` entries appended, and
 *   reports write to `.reports/coverage` unless overridden.
 * - Provide `opts.outputFile` to change the default JUnit destination (`.reports/junit.xml`).
 * - Any `opts.plugins` array is passed directly to `defineConfig` for additional Vite/Vitest plugins.
 * Fields beyond those listed above currently have no effect but remain type-compatible through
 * {@link Options}.
 *
 * @param opts - Inline overrides for coverage behaviour, plugin registration, or report locations.
 * @returns Vitest configuration produced via `defineConfig`.
 * @public
 */
export function baseTestPreset(opts: Options = {}) {
  const cvrg = opts.coverage;
  return defineConfig({
    ...(opts.plugins ? { plugins: opts.plugins } : {}),
    test: {
      coverage: {
        provider: "v8",
        enabled: cvrg?.enabled ?? false,
        exclude: [
          "**/*.d.ts",
          "dist/**",
          "coverage/**",
          ...(cvrg?.exclude ?? []),
        ],
        reporter: ["text-summary", "lcov", "html"],
        reportsDirectory: cvrg?.reportsDirectory ?? ".reports/coverage",
      },
      environment: "node",
      outputFile: opts.outputFile ?? ".reports/junit.xml",
    },
  });
}

/**
 * Creates a browser-oriented Vitest configuration with CSS support and shared setup defaults.
 *
 * @remarks
 * Mirrors the shared coverage configuration from {@link baseTestPreset}, defaulting to the `v8` provider
 * and staying disabled unless `opts.coverage?.enabled` is truthy. Additional behaviour:
 * - CSS processing is enabled unless explicitly turned off through `opts.css`.
 * - The setup sequence prepends `./src/test/setup-tests.ts` (relative to the consuming package) before
 *   any `opts.setupFiles` entries so DOM polyfills run consistently.
 * - Any `opts.plugins` array is forwarded to `defineConfig` to register extra Vite/Vitest plugins.
 * As with the base preset, other {@link Options} fields are currently ignored.
 *
 * @param opts - Inline overrides for coverage behaviour, CSS handling, setup files, or plugins.
 * @returns Vitest configuration produced via `defineConfig`.
 * @public
 */
export function browserTestPreset(opts: Options = {}) {
  const cvrg = opts.coverage;
  return defineConfig({
    ...(opts.plugins ? { plugins: opts.plugins } : {}),
    test: {
      coverage: {
        provider: "v8",
        enabled: cvrg?.enabled ?? false,
        exclude: [
          "**/*.d.ts",
          "dist/**",
          "coverage/**",
          ...(cvrg?.exclude ?? []),
        ],
        reporter: ["text-summary", "lcov", "html"],
        reportsDirectory: cvrg?.reportsDirectory ?? ".reports/coverage",
      },
      css: opts.css ?? true,
      environment: "jsdom",
      outputFile: opts.outputFile ?? ".reports/junit.xml",
      setupFiles: ["./src/test/setup-tests.ts", ...(opts.setupFiles ?? [])],
    },
  });
}
