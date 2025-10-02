import { defineConfig } from "vitest/config";

/**
 * Builds the shared Vitest configuration used across workspace packages.
 *
 * @remarks
 * - Disables coverage by default but keeps reporters configured so individual packages can opt in.
 * - Emits JUnit output under `.reports/junit.xml` to integrate with CI dashboards.
 *
 * @returns A Vitest configuration object produced via `defineConfig`.
 * @public
 */
export function basePreset() {
  return defineConfig({
    test: {
      coverage: {
        provider: "v8",
        enabled: false,
        exclude: ["**/*.d.ts", "dist/**", "coverage/**"],
        reporter: ["text-summary", "lcov", "html"],
        reportsDirectory: ".reports/coverage",
      },
      outputFile: ".reports/junit.xml",
    },
  });
}
