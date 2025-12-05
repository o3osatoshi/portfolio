import "@o3osatoshi/ui/globals.css";

import type { Preview } from "@storybook/react-vite";

const preview: Preview = {
  parameters: {
    a11y: {
      config: {
        rules: [
          { id: "color-contrast", enabled: true },
          // The following accessibility rules are disabled because Storybook stories often lack full page structure,
          // which would cause these rules to produce false positives. See CodeQL rule documentation for details.
          { id: "landmark-one-main", enabled: false },
          { id: "region", enabled: false },
        ],
      },
      manual: false,
      options: {
        element: "#storybook-root",
        restoreScroll: true,
      },
      test: "error",
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
