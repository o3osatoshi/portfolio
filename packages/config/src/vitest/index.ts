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
export function basePreset(opts: InlineConfig = {}) {
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
