import { defineConfig } from "vitest/config";

export function baseConfig() {
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
