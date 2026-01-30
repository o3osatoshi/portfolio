import { playwright } from "@vitest/browser-playwright";
import {
  defineConfig,
  type TestProjectConfiguration,
  type TestProjectInlineConfiguration,
  type ViteUserConfig,
} from "vitest/config";
import type { CoverageV8Options, InlineConfig } from "vitest/node";

/**
 * Supported overrides for the shared Vitest presets.
 *
 * Provides a thin wrapper allowing consumers to forward a `test` InlineConfig from `vitest/node` alongside
 * optional Vite/Vitest plugins exposed via `ViteUserConfig["plugins"]` and Vite resolve settings via
 * `ViteUserConfig["resolve"]`.
 *
 * @public
 */
export type Options = {
  plugins?: ViteUserConfig["plugins"];
  resolve?: ViteUserConfig["resolve"];
  test?: {
    coverage?: CoverageV8Options;
  } & InlineConfig;
};

/**
 * Creates the shared Vitest configuration for workspace packages with consistent reporting defaults.
 *
 * @remarks
 * Spreads any user-provided InlineConfig through `opts.test` before re-applying the shared defaults for
 * coverage, environment, and reporting paths so the baseline remains consistent.
 * - Coverage uses the `v8` provider, stays disabled by default, and emits text-summary, LCOV, and HTML
 *   reports under `.reports/coverage`. Supply `opts.test?.coverage` to adjust the baseline—because the
 *   preset rebuilds the coverage object, specify all desired fields when overriding.
 * - The test environment defaults to `node`, and the JUnit reporter writes to `.reports/junit.xml`
 *   unless `opts.test?.environment` or `opts.test?.outputFile` override those values.
 * - Any Vite/Vitest `opts.plugins` values are forwarded directly to `defineConfig`.
 * - Vite resolve settings can be forwarded through `opts.resolve` (aliases, extensions, etc.).
 * Additional InlineConfig fields provided via `opts.test` remain untouched unless they collide with the
 * enforced defaults above.
 *
 * @param opts - Optional InlineConfig details and plugin registrations to merge into the preset.
 * @returns Vitest configuration produced via `defineConfig`.
 * @public
 */
export function baseTestPreset(opts: Options = {}) {
  const cvrg = opts.test?.coverage;
  return defineConfig({
    ...(opts.plugins ? { plugins: opts.plugins } : {}),
    ...(opts.resolve ? { resolve: opts.resolve } : {}),
    test: {
      ...opts.test,
      coverage: {
        provider: "v8",
        enabled: cvrg?.enabled ?? false,
        exclude: [
          "**/*.d.ts",
          "dist/**",
          "coverage/**",
          "**/index.{ts,js}",
          ...(cvrg?.exclude ?? []),
        ],
        include: cvrg?.include ?? ["src/**/*.{ts,tsx,js,jsx}"],
        reporter: ["text-summary", "lcov", "html"],
        reportsDirectory: cvrg?.reportsDirectory ?? ".reports/coverage",
      },
      dir: opts.test?.dir ?? "src",
      environment: "node",
      outputFile: opts.test?.outputFile ?? ".reports/junit.xml",
    },
  });
}

/**
 * Creates a browser-oriented Vitest configuration with CSS support and shared setup defaults.
 *
 * @remarks
 * Shares the merge behaviour of {@link baseTestPreset} while tailoring defaults for browser tests.
 * - Spreads `opts.test` first, then reapplies the shared defaults so coverage, environment, and CSS
 *   handling stay aligned across packages.
 * - Coverage falls back to the same `v8`-based defaults unless `opts.test?.coverage` is supplied. When
 *   overriding coverage, include every field you need because the preset rebuilds the object.
 * - CSS handling is enabled (`true`) by default and can be disabled by setting `opts.test?.css`.
 * - The environment defaults to `jsdom`, though any fields supplied via `opts.test` override the
 *   preset after defaults are applied.
 * - Additional Vite/Vitest plugins can be registered through `opts.plugins`.
 * - Vite resolve settings can be forwarded through `opts.resolve` (aliases, extensions, etc.).
 *
 * @param opts - Optional InlineConfig details and plugin registrations to merge into the preset.
 * @returns Vitest configuration produced via `defineConfig`.
 * @public
 */
export function browserTestPreset(opts: Options = {}) {
  const cvrg = opts.test?.coverage;
  return defineConfig({
    ...(opts.plugins ? { plugins: opts.plugins } : {}),
    ...(opts.resolve ? { resolve: opts.resolve } : {}),
    test: {
      ...opts.test,
      coverage: {
        provider: "v8",
        enabled: cvrg?.enabled ?? false,
        exclude: [
          "**/*.d.ts",
          "dist/**",
          "coverage/**",
          "**/index.{ts,js}",
          ...(cvrg?.exclude ?? []),
        ],
        include: cvrg?.include ?? ["src/**/*.{ts,tsx,js,jsx}"],
        reporter: ["text-summary", "lcov", "html"],
        reportsDirectory: cvrg?.reportsDirectory ?? ".reports/coverage",
      },
      css: opts.test?.css ?? true,
      dir: opts.test?.dir ?? "src",
      environment: "jsdom",
      outputFile: opts.test?.outputFile ?? ".reports/junit.xml",
    },
  });
}

/**
 * Creates a Storybook-aware Vitest configuration that enables browser projects by default.
 *
 * @remarks
 * Mirrors the base preset merge behaviour while ensuring Storybook projects run in Playwright-powered
 * Chromium. Any InlineConfig projects passed through `opts.test?.projects` are converted into inline
 * configurations with the Storybook defaults applied, while non-inline entries remain untouched.
 * Coverage retains the shared defaults unless fully redefined via `opts.test?.coverage`. Additional
 * Vite/Vitest plugins cascade through `opts.plugins`, and Vite resolve settings can be supplied via
 * `opts.resolve`.
 *
 * @param opts - Optional InlineConfig details and plugin registrations to merge into the preset.
 * @returns Vitest configuration produced via `defineConfig`.
 * @public
 */
export function storybookTestPreset(opts: Options = {}) {
  const cvrg = opts.test?.coverage;
  return defineConfig({
    ...(opts.plugins ? { plugins: opts.plugins } : {}),
    ...(opts.resolve ? { resolve: opts.resolve } : {}),
    test: {
      ...(opts.test?.projects
        ? {
            projects: opts.test.projects.map((p) => {
              if (!checkIfTestProjectInlineConfiguration(p)) return p;
              return {
                extends: true,
                ...(p.plugins ? { plugins: p.plugins } : {}),
                test: {
                  name: "storybook",
                  browser: {
                    provider: playwright({ launchOptions: { headless: true } }),
                    enabled: true,
                    instances: [{ browser: "chromium" }],
                  },
                  ...(p.test?.setupFiles
                    ? { setupFiles: p.test.setupFiles }
                    : {}),
                },
              };
            }),
          }
        : {}),
      coverage: {
        provider: "v8",
        enabled: cvrg?.enabled ?? false,
        exclude: [
          "**/*.d.ts",
          "dist/**",
          "coverage/**",
          "**/index.{ts,js}",
          ...(cvrg?.exclude ?? []),
        ],
        reporter: ["text-summary", "lcov", "html"],
        reportsDirectory: cvrg?.reportsDirectory ?? ".reports/coverage",
      },
      outputFile: opts.test?.outputFile ?? ".reports/junit.xml",
    },
  });
}

/**
 * Narrows a Vitest project configuration to inline objects suitable for Storybook overrides.
 *
 * Filters out project entries that are strings, config factories, or async workspace configs so only
 * inline configuration objects return true, enabling safe augmentation inside {@link storybookTestPreset}.
 *
 * @param config - The project configuration entry to inspect.
 * @returns Whether the configuration is an inline project object.
 */
function checkIfTestProjectInlineConfiguration(
  config: TestProjectConfiguration,
): config is TestProjectInlineConfiguration {
  // string
  if (typeof config === "string") return false;
  // UserProjectConfigFn
  if (typeof config === "function") return false;
  // Promise<UserWorkspaceConfig>
  if (
    "then" in config &&
    typeof config.then === "function" &&
    "catch" in config &&
    typeof config.catch === "function"
  )
    return false;
  // TestProjectInlineConfiguration
  return true;
}
