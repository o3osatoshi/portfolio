// @ts-check
import jsonc from "eslint-plugin-jsonc";
import jsoncParser from "jsonc-eslint-parser";

/**
 * Fast & Useful JSON/JSONC config (package.json excluded)
 */
export default [
  {
    files: ["**/*.{json,jsonc,json5}"],
    ignores: ["**/package.json", "**/pnpm-lock.yaml"],

    languageOptions: { parser: jsoncParser },
    plugins: { jsonc },

    rules: {
      "jsonc/valid-json-number": "error",
      "jsonc/no-dupe-keys": "error",
      "jsonc/no-octal": "error",
      "jsonc/sort-keys": "error",
    },
  },

  {
    files: ["**/*.json"],
    ignores: ["**/package.json"],
    rules: {
      "jsonc/no-comments": "error",
    },
  },
];
