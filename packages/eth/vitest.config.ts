import { baseTestPreset } from "@o3osatoshi/config/vitest";

export default baseTestPreset({
  test: {
    coverage: {
      exclude: ["src/generated.ts"],
    },
  },
});
