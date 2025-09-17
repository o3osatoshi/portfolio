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
      "**/storybook-static/**",
    ],
  },
  ...perfectionist,
  ...vitest,
];
