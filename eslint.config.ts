import type { ConfigArray } from "typescript-eslint";
import tseslint from "typescript-eslint";
import * as pluginVue from "eslint-plugin-vue";

const config: ConfigArray = [
  // Global ignores
  {
    ignores: [
      "node_modules/**",
      "pnpm-lock.yaml",
      "**/dist/**",
      "**/build/**",
      "**/.nuxt/**",
      "**/.output/**",
      "**/coverage/**",
      "**/.vitepress/**",
      "**/--port/**",
      "**/*.d.ts",
      "**/*.min.js",
      "**/*.min.css",
      "**/*chunk-*.js",
      "**/deps/*.js",
      "**/scripts/*.cjs",
      "*.log",
      // These packages have their own ESLint configs — lint them separately
      "packages/playground/vue/**",
      "packages/test/**",
    ],
  },

  // Base recommended rules
  ...tseslint.configs.recommended,
  {
    languageOptions: {
      parserOptions: {
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },

  // Vue files
  ...pluginVue.configs["flat/essential"],
  {
    files: ["**/*.vue"],
    languageOptions: {
      parserOptions: {
        parser: tseslint.parser,
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },

  // Shared rules for TS and Vue
  {
    files: ["**/*.{ts,tsx,mts,vue}"],
    rules: {
      "no-empty": ["error", { allowEmptyCatch: true }],
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/explicit-function-return-type": "off",
      "@typescript-eslint/no-explicit-any": "warn",
    },
  },

  // Vue specific rules
  {
    files: ["**/*.vue"],
    rules: {
      "vue/multi-word-component-names": "off",
      "vue/no-v-html": "off",
      "vue/no-dupe-keys": "off",
    },
  },

  // CommonJS files
  {
    files: ["**/*.cjs"],
    languageOptions: {
      sourceType: "commonjs",
    },
    rules: {
      "@typescript-eslint/no-require-imports": "off",
    },
  },
];

export default config;
