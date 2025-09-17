// @ts-check
import vitest from "eslint-plugin-vitest";

/**
 * Vitest-focused flat config
 * - Targets only test files
 * - Starts from plugin recommended rules
 * - Adds a few high-signal checks
 */
export default [
  {
    // Target test files only
    files: [
      "**/*.{test,spec}.{js,jsx,ts,tsx,mjs,cjs,mts,cts}",
      "**/__tests__/**/*.{js,jsx,ts,tsx,mjs,cjs,mts,cts}",
    ],

    plugins: { vitest },

    // Declare Vitest globals to avoid undefined variable errors
    languageOptions: {
      globals: {
        afterAll: "readonly",
        afterEach: "readonly",
        // hooks
        beforeAll: "readonly",
        beforeEach: "readonly",
        describe: "readonly",
        expect: "readonly",
        it: "readonly",
        test: "readonly",
        // core
        vi: "readonly",
      },
    },

    // Start from plugin recommended config
    ...vitest.configs.recommended,

    rules: {
      "vitest/no-identical-title": "warn",
      "vitest/valid-title": "warn",
      "vitest/expect-expect": "warn",
      "vitest/no-disabled-tests": "warn", // discourage .skip
      // High-signal, low-noise extras
      "vitest/no-focused-tests": "error", // prevent .only
      "vitest/prefer-hooks-in-order": "warn",
      "vitest/prefer-hooks-on-top": "warn",
    },
  },

  // Relax rules for setup/environment files
  {
    files: ["**/vitest.setup.*", "**/setupTests.*", "**/test-utils/**"],
    rules: {
      "vitest/valid-title": "off",
      "vitest/expect-expect": "off",
    },
  },
];
