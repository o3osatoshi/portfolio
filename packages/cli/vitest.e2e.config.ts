import { baseTestPreset } from "@o3osatoshi/config/vitest";

export default baseTestPreset({
  test: {
    dir: "e2e",
    fileParallelism: false,
    hookTimeout: 30_000,
    testTimeout: 30_000,
  },
});
