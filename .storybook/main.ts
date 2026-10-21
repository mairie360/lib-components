import { fileURLToPath } from 'node:url';
import type { StorybookConfig } from '@storybook/react-vite';

// Components reach the kit through the published entries; inside the repo the
// Storybook Vite build maps them to src/kit, like the Jest moduleNameMapper (MAIR-608).
const kit = (name: string) => fileURLToPath(new URL(`../src/kit/${name}.ts`, import.meta.url));

const config: StorybookConfig = {
  "stories": [
    "../src/**/*.mdx",
    "../src/**/*.stories.@(js|jsx|mjs|ts|tsx)"
  ],
  "addons": [
    "@storybook/addon-onboarding",
    "@chromatic-com/storybook",
    "@storybook/addon-vitest",
    "@storybook/addon-docs"
  ],
  "framework": {
    "name": "@storybook/react-vite",
    "options": {}
  },
  "staticDirs": [
    "../public"
  ],
  viteFinal: async (config) => ({
    ...config,
    resolve: {
      ...config.resolve,
      alias: [
        ...(Array.isArray(config.resolve?.alias) ? config.resolve.alias : Object.entries(config.resolve?.alias ?? {}).map(([find, replacement]) => ({ find, replacement }))),
        { find: '@mairie360/lib-components/shared', replacement: kit('shared') },
        { find: '@mairie360/lib-components/react', replacement: kit('react') },
        { find: '@mairie360/lib-components/theme', replacement: kit('theme') },
      ],
    },
  }),
};
export default config;
