
import globals from "globals";
import pluginJs from "@eslint/js";
import pluginReactConfig from "eslint-plugin-react/configs/recommended.js";
import pluginReactHooks from "eslint-plugin-react-hooks";
import pluginReactRefresh from "eslint-plugin-react-refresh";

export default [
  { files: ["**/*.{js,mjs,cjs,jsx}"] },
  {
    // Global ignores
    ignores: ["dist", "node_modules", ".firebase"],
  },
  // ESLint recommended settings
  pluginJs.configs.recommended,
  // React recommended settings
  {
    ...pluginReactConfig,
    settings: {
      react: {
        version: "detect",
      },
    },
  },
  // React Hooks plugin configuration
  {
    plugins: {
      "react-hooks": pluginReactHooks,
    },
    rules: {
      ...pluginReactHooks.configs.recommended.rules,
    },
  },
  // React Refresh plugin configuration
  {
    plugins: {
      "react-refresh": pluginReactRefresh,
    },
    rules: {
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],
    },
  },
  // General language options
  {
    languageOptions: {
      globals: globals.browser,
      ecmaVersion: "latest",
      sourceType: "module",
      parserOptions: {
        ecmaFeatures: { jsx: true },
      },
    },
  },
  // Custom project rules
  {
    rules: {
      "no-unused-vars": ["warn", { "varsIgnorePattern": "^_" }],
      "react/react-in-jsx-scope": "off",
      "react/prop-types": "off", // Disable prop-types rule
    },
  },
];
