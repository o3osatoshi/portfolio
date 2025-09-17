// packages/config/eslint/vitest.mjs
// @ts-check
import vitest from "eslint-plugin-vitest";

/**
 * Vitest-focused Flat Config (fast & effective)
 * - Targets only test files
 * - Starts from plugin's recommended rules
 * - Adds a few high-signal checks
 */
export default [
  {
    // テストだけに限定（性能◎）
    files: [
      "**/*.{test,spec}.{js,jsx,ts,tsx,mjs,cjs,mts,cts}",
      "**/__tests__/**/*.{js,jsx,ts,tsx,mjs,cjs,mts,cts}",
    ],

    plugins: { vitest },

    // Vitest のグローバルを明示（環境依存の未定義エラーを防止）
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

    // 推奨セットをベースに（衝突・ノイズが少ない）
    ...vitest.configs.recommended,

    rules: {
      "vitest/no-identical-title": "warn",
      "vitest/valid-title": "warn",
      "vitest/expect-expect": "warn",
      "vitest/no-disabled-tests": "warn", // .skip を減らす
      // 追加の“効きが良い”ルール（誤検出少なめ）
      "vitest/no-focused-tests": "error", // .only 防止
      "vitest/prefer-hooks-in-order": "warn",
      "vitest/prefer-hooks-on-top": "warn",
      // 必要に応じて追加:
      // "vitest/no-conditional-expect": "warn",
      // "vitest/no-alias-methods": "warn",
      // "vitest/max-nested-describe": ["warn", { max: 4 }],
    },
  },

  // セットアップ/環境ファイルは厳しめルールを緩める（誤検出回避）
  {
    files: ["**/vitest.setup.*", "**/setupTests.*", "**/test-utils/**"],
    rules: {
      "vitest/valid-title": "off",
      "vitest/expect-expect": "off",
    },
  },
];
