import tsParser from "@typescript-eslint/parser";
import perfectionist from "eslint-plugin-perfectionist";

/** @type {import("eslint").Linter.FlatConfig[]} */
export default [
  {
    ignores: [
      "**/node_modules/**",
      "**/generated/**",
      "**/dist/**",
      "**/storybook-static/**",
      "**/.next/**",
      "**/.turbo/**",
      "**/.idea/**",
    ],
  },

  {
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      parser: tsParser,
      sourceType: "module",
    },
    plugins: { perfectionist },
    rules: { "perfectionist/sort-objects": "error" },
  },

  {
    files: ["**/*.{js,jsx,mjs,cjs,mts,cts}"],
    plugins: { perfectionist },
    rules: { "perfectionist/sort-objects": "error" },
  },
];
