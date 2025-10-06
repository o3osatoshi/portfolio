import { defineConfig, type ViteUserConfig } from "vitest/config";
import type { InlineConfig } from "vitest/node";

/**
 * Supported overrides for the shared Vitest presets.
 *
 * Provides a thin wrapper allowing consumers to forward a `test` {@link InlineConfig} alongside
 * optional Vite/Vitest plugins exposed via `ViteUserConfig["plugins"]`.
 *
 * @public
 */
export type Options = {
  plugins?: ViteUserConfig["plugins"];
  test?: InlineConfig;
};

/**
 * Creates the shared Vitest configuration for workspace packages with consistent reporting defaults.
 *
 * @remarks
 * Applies workspace defaults before spreading any user-provided {@link InlineConfig} through
 * `opts.test`.
 * - Coverage uses the `v8` provider, stays disabled by default, and emits text-summary, LCOV, and HTML
 *   reports under `.reports/coverage` whenever no explicit `opts.test?.coverage` is supplied. Supplying
 *   a coverage object replaces the defaults entirely, so include baseline values if they are still
 *   required.
 * - The test environment defaults to `node`, and the JUnit reporter writes to `.reports/junit.xml`
 *   unless `opts.test?.environment` or `opts.test?.outputFile` override those values.
 * - Any Vite/Vitest `opts.plugins` values are forwarded directly to `defineConfig`.
 * Additional {@link InlineConfig} fields can be provided via `opts.test` and override the defaults after
 * they are applied.
 *
 * @param opts - Optional InlineConfig details and plugin registrations to merge into the preset.
 * @returns Vitest configuration produced via `defineConfig`.
 * @public
 */
export function baseTestPreset(opts: Options = {}) {
  const cvrg = opts.test?.coverage;
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
      outputFile: opts.test?.outputFile ?? ".reports/junit.xml",
      ...opts.test,
    },
  });
}

/**
 * Creates a browser-oriented Vitest configuration with CSS support and shared setup defaults.
 *
 * @remarks
 * Shares the merge behaviour of {@link baseTestPreset} while tailoring defaults for browser tests.
 * - Coverage falls back to the same `v8`-based defaults unless `opts.test?.coverage` is supplied, in
 *   which case the provided object replaces the preset values.
 * - CSS handling is enabled (`true`) by default and can be disabled by setting `opts.test?.css`.
 * - The environment defaults to `jsdom`, though any fields supplied via `opts.test` override the
 *   preset after defaults are applied.
 * - Additional Vite/Vitest plugins can be registered through `opts.plugins`.
 *
 * @param opts - Optional InlineConfig details and plugin registrations to merge into the preset.
 * @returns Vitest configuration produced via `defineConfig`.
 * @public
 */
export function browserTestPreset(opts: Options = {}) {
  const cvrg = opts.test?.coverage;
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
      css: opts.test?.css ?? true,
      environment: "jsdom",
      outputFile: opts.test?.outputFile ?? ".reports/junit.xml",
      ...opts.test,
    },
  });
}
