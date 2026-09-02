import { FlatCompat } from "@eslint/eslintrc";

const compat = new FlatCompat({
  baseDirectory: import.meta.dirname,
});

const eslintConfig = [
  {
    ignores: [
      ".lighthouseci/**",
      ".next/**",
      "coverage/**",
      "dist/**",
      "storybook-static/**",
      "next-env.d.ts",
    ],
  },
  ...compat.config({
    extends: ["next/core-web-vitals", "next/typescript"],
  }),
  {
    files: ["**/*.cjs"],
    rules: {
      "@typescript-eslint/no-require-imports": "off",
    },
  },
];

export default eslintConfig;
