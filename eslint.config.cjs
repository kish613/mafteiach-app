// Flat config for ESLint v9+ (CommonJS)
const js = require("@eslint/js");
const tseslint = require("typescript-eslint");
const reactPlugin = require("eslint-plugin-react");
const reactHooks = require("eslint-plugin-react-hooks");

module.exports = [
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
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_", varsIgnorePattern: "^_" }],
      "no-undef": "off",
      ...(reactPlugin.configs.recommended?.rules || {}),
      ...(reactHooks.configs.recommended?.rules || {}),
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
