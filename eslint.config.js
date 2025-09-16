// Flat config for ESLint v9+
// Minimal, TS-first RN setup using existing devDependencies

import js from "@eslint/js";
import tseslint from "typescript-eslint";
import reactPlugin from "eslint-plugin-react";
import reactHooks from "eslint-plugin-react-hooks";

export default [
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["**/*.ts", "**/*.tsx"],
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: {
        ecmaVersion: 2024,
        sourceType: "module",
        ecmaFeatures: { jsx: true },
      },
      globals: {
        __DEV__: "readonly",
      },
    },
    plugins: {
      react: reactPlugin,
      "react-hooks": reactHooks,
    },
    rules: {
      // General TS/JS
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
      "no-undef": "off",
      // React
      ...reactPlugin.configs.recommended.rules,
      ...reactHooks.configs.recommended.rules,
      "react/react-in-jsx-scope": "off",
    },
    settings: {
      react: { version: "detect" },
    },
  },
  {
    ignores: [
      "node_modules/**",
      "dist/**",
      "build/**",
      "android/**",
      "ios/**",
      "patches/**",
      "assets/**",
      ".expo/**",
    ],
  },
];
