import { baseTestPreset } from "@o3osatoshi/config/vitest";

export default baseTestPreset({
  test: {
    hookTimeout: 120_000,
    testTimeout: 120_000,
  },
});
