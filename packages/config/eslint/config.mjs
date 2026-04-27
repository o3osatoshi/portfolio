import jsonc from "./jsonc.mjs";
import perfectionist from "./perfectionist.mjs";
import vitest from "./vitest.mjs";

export default [
  {
    ignores: [
      "**/node_modules/**",
      "**/dist/**",
      "**/generated/**",
      "**/.next/**",
      "**/.turbo/**",
      "**/.idea/**",
      "**/.reports/**",
      "**/coverage/**",
      "**/storybook-static/**",
      "**/temp/*.api.json",
    ],
  },
  ...perfectionist,
  ...jsonc,
  ...vitest,
];
