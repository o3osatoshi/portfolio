import "@o3osatoshi/ui/globals.css";

import type { Preview } from "@storybook/react-vite";

const preview: Preview = {
  parameters: {
    a11y: {
      config: {
        rules: [
          { id: "color-contrast", enabled: true },
          { id: "landmark-one-main", enabled: true },
          { id: "region", enabled: true },
        ],
      },
      manual: false,
      options: {
        element: "#storybook-root",
        restoreScroll: true,
        runOnly: {
          type: "tag",
          values: ["wcag2a", "wcag2aa", "wcag21aa"],
        },
      },
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },

  tags: ["autodocs"],
};

export default preview;
