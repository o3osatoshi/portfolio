import { dirname, join, resolve } from "node:path";

function getAbsolutePath(value) {
  return dirname(require.resolve(join(value, "package.json")));
}

const config = {
  addons: [
    getAbsolutePath("@chromatic-com/storybook"),
    getAbsolutePath("@storybook/addon-a11y"),
    getAbsolutePath("@storybook/addon-coverage"),
    getAbsolutePath("@storybook/addon-docs"),
    getAbsolutePath("@storybook/addon-links"),
    getAbsolutePath("@storybook/addon-vitest"),
  ],

  core: {},

  framework: {
    name: getAbsolutePath("@storybook/react-vite"),
    options: {},
  },

  staticDirs: ["../public"],
  stories: ["../../../packages/ui/src/**/*.stories.@(ts|tsx|js|jsx|mdx)"],

  async viteFinal(config, { _configType }) {
    // customize the Vite config here
    return {
      ...config,
      build: {
        ...(config.build ?? {}),
        chunkSizeWarningLimit: 1500,
      },
      define: { "process.env": {} },
      resolve: {
        alias: [
          {
            find: "ui",
            replacement: resolve(__dirname, "../../../packages/ui/"),
          },
        ],
      },
    };
  },
};

export default config;
