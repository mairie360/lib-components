import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  globalIgnores([
    ".lighthouseci/**",
    ".next/**",
    "coverage/**",
    "dist/**",
    "storybook-static/**",
    "next-env.d.ts",
  ]),
  ...nextVitals,
  ...nextTs,
  {
    // React Compiler rules introduced by eslint-plugin-react-hooks v7 (Next 16).
    // They flag the existing prop-to-state sync effects; report them without
    // failing CI until those components are migrated.
    files: ["**/*.{js,jsx,mjs,ts,tsx,mts,cts}"],
    rules: {
      "react-hooks/set-state-in-effect": "warn",
    },
  },
  {
    files: ["**/*.cjs"],
    rules: {
      "@typescript-eslint/no-require-imports": "off",
    },
  },
]);

export default eslintConfig;
