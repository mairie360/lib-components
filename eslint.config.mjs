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
      "no-await-in-loop": "error",
      "react-hooks/set-state-in-effect": "warn",
    },
  },
  {
    // These hash-verified upstream packages explicitly declare CommonJS and
    // retain their original require/module.exports API, like our .cjs scripts.
    files: ["**/*.cjs", "vendor/braces/**/*.js", "vendor/sprintf-js/**/*.js"],
    rules: {
      "@typescript-eslint/no-require-imports": "off",
    },
  },
]);

export default eslintConfig;
