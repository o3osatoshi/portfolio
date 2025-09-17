import tsParser from "@typescript-eslint/parser";
import perfectionist from "eslint-plugin-perfectionist";

const INTERNAL_PATTERNS = ["^@/", "^@o3osatoshi/", "^apps/", "^packages/"];

export default [
  // 1. Perfectionist plugin registration (no presets)
  {
    files: ["**/*.{js,jsx,ts,tsx,mjs,cjs,mts,cts}"],
    linterOptions: { reportUnusedDisableDirectives: true },
    plugins: { perfectionist },
  },

  // 2. Use the TS parser in a separate block
  {
    files: ["**/*.{ts,tsx,mts,cts}"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        // project: ["./tsconfig.json"],
        // tsconfigRootDir: import.meta.dirname,
      },
    },
  },

  // 3. Override rules in another block (no "plugins" here)
  {
    files: ["**/*.{js,jsx,ts,tsx,mjs,cjs,mts,cts}"],
    rules: {
      "perfectionist/sort-named-exports": [
        "error",
        { ignoreCase: true, order: "asc", type: "natural" },
      ],
      "perfectionist/sort-named-imports": [
        "error",
        { ignoreCase: true, order: "asc", type: "natural" },
      ],
      "perfectionist/sort-array-includes": "error",
      "perfectionist/sort-classes": "error",
      "perfectionist/sort-decorators": "error",
      "perfectionist/sort-enums": "error",
      "perfectionist/sort-exports": "error",
      "perfectionist/sort-imports": [
        "error",
        {
          groups: [
            "side-effect",
            "builtin",
            "external",
            "internal",
            ["parent", "sibling", "index"],
            "style",
            "unknown",
          ],
          internalPattern: INTERNAL_PATTERNS,
          newlinesBetween: "always",
          order: "asc",
          type: "natural",
        },
      ],
      "perfectionist/sort-interfaces": "error",
      "perfectionist/sort-intersection-types": "error",
      "perfectionist/sort-maps": "error",
      "perfectionist/sort-modules": "error",
      "perfectionist/sort-object-types": "error",
      "perfectionist/sort-objects": [
        "error",
        {
          customGroups: { top: ["id", "name"] },
          groups: ["top", "unknown"],
          order: "asc",
          partitionByNewLine: true,
          type: "natural",
        },
      ],
      "perfectionist/sort-sets": "error",
      "perfectionist/sort-union-types": "error",
      "perfectionist/sort-variable-declarations": "error",
    },
  },

  // 4. JSX-specific sorting
  {
    files: ["**/*.{jsx,tsx}"],
    rules: {
      "perfectionist/sort-jsx-props": [
        "error",
        {
          customGroups: {
            top: ["key", "ref", "id", "data-testid"],
          },
          groups: ["top", "unknown"],
          order: "asc",
          type: "natural",
        },
      ],
    },
  },
];
