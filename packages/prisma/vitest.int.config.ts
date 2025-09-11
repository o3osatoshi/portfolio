import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
    hookTimeout: 120_000,
    include: ["src/**/*.int.spec.ts"],
    testTimeout: 120_000,
  },
});
