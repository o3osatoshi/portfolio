import { defineConfig } from "vitest/config";
import type { InlineConfig } from "vitest/node";

/**
 * Creates the shared Vitest configuration for workspace packages with consistent reporting defaults.
 *
 * @remarks
 * Coverage defaults to the `v8` provider and remains disabled unless `opts.coverage?.enabled` is set.
 * Core exclusions are enforced, with any additional `opts.coverage?.exclude` entries appended, and
 * reports write to `.reports/coverage` unless overridden. A JUnit report is emitted to
 * `.reports/junit.xml` by default; provide `opts.outputFile` to change the destination. Currently only
 * the coverage-related fields and `outputFile` from `opts` are honored.
 *
 * @param opts - Inline overrides for coverage behaviour or output locations.
 * @returns Vitest configuration produced via `defineConfig`.
 * @public
 */
export function baseTestPreset(opts: InlineConfig = {}) {
  const cvrg = opts.coverage;
  return defineConfig({
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
      outputFile: opts.outputFile ?? ".reports/junit.xml",
    },
  });
}

/**
 * Creates a browser-oriented Vitest configuration with CSS support and shared setup defaults.
 *
 * @remarks
 * Mirrors the shared coverage configuration from {@link baseTestPreset}, defaulting to the `v8` provider
 * and staying disabled unless `opts.coverage?.enabled` is truthy. CSS processing is enabled unless
 * explicitly turned off through `opts.css`. The setup sequence prepends `./src/test/setupTests.ts`
 * (relative to the consuming package) before any `opts.setupFiles` entries, so browser utilities like
 * DOM polyfills load consistently.
 *
 * @param opts - Inline overrides for coverage behaviour, CSS handling, or setup files.
 * @returns Vitest configuration produced via `defineConfig`.
 * @public
 */
export function browserTestPreset(opts: InlineConfig = {}) {
  const cvrg = opts.coverage;
  return defineConfig({
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
      outputFile: opts.outputFile ?? ".reports/junit.xml",
      setupFiles: ["./src/test/setupTests.ts", ...(opts.setupFiles ?? [])],
    },
  });
}
