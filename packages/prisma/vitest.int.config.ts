import { baseTestPreset } from "@o3osatoshi/config/vitest";

export default baseTestPreset({
  test: {
    hookTimeout: 120_000,
    include: ["src/**/*.int.spec.ts"],
    testTimeout: 120_000,
  },
});
