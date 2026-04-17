import js from "@eslint/js";
import ts from "@typescript-eslint/eslint-plugin";
import tsParser from "@typescript-eslint/parser";
import vue from "eslint-plugin-vue";
import vueParser from "vue-eslint-parser";

export default [
  // Global ignores (applies to all files)
  {
    ignores: [
      // Dependencies
      "node_modules/**",
      "pnpm-lock.yaml",

      // Build outputs
      "dist/**",
      "build/**",
      "**/dist/**",
      "**/build/**",

      // Framework specific
      ".next/**",
      ".nuxt/**",
      ".output/**",
      "**/.nuxt/**",
      "**/.output/**",

      // Testing and coverage
      "coverage/**",
      "**/coverage/**",

      // Documentation builds and cache
      ".vitepress/dist/**",
      ".vitepress/cache/**",
      "**/.vitepress/dist/**",
      "**/.vitepress/cache/**",
      "**/--port/**",

      // Type definitions (auto-generated)
      "**/*.d.ts",

      // Minified files
      "*.min.js",
      "**/*.min.js",
      "*.min.css",

      // Bundler generated files
      "**/*chunk-*.js",
      "**/deps/*.js",
      "**/*.deps.js",

      // Lock files and logs
      "*.log",
      "npm-debug.log*",
      "yarn-debug.log*",
      "yarn-error.log*",

      // Temporary files
      "*.tmp",
      "*.temp",
      ".cache/**",
      "**/tmp/**",
      "**/temp/**",

      // IDE and OS
      ".DS_Store",
      "Thumbs.db",
      ".vscode/",
      ".idea/",
    ],
  },

  // Base JS rules
  {
    files: ["**/*.{js,mjs,cjs}"],
    ...js.configs.recommended,
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "module",
      globals: {
        console: "readonly",
        process: "readonly",
        Buffer: "readonly",
        global: "readonly",
        __dirname: "readonly",
        __filename: "readonly",
        module: "readonly",
        require: "readonly",
        exports: "readonly",
      },
    },
  },

  // TypeScript files
  {
    files: ["**/*.{ts,tsx,mts}"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
      },
    },
    plugins: {
      "@typescript-eslint": ts,
    },
    rules: {
      ...js.configs.recommended.rules,
      "no-unused-vars": "off", // Use @typescript-eslint version
      "no-redeclare": "off", // TS handles overloads
      "no-empty": ["error", { allowEmptyCatch: true }],
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "@typescript-eslint/explicit-function-return-type": "off",
      "@typescript-eslint/no-explicit-any": "warn",
      "no-undef": "off", // TypeScript handles this
    },
  },

  // Vue files
  {
    files: ["**/*.vue"],
    languageOptions: {
      parser: vueParser,
      parserOptions: {
        parser: tsParser,
        ecmaVersion: "latest",
        sourceType: "module",
      },
    },
    plugins: {
      vue,
      "@typescript-eslint": ts,
    },
    rules: {
      ...js.configs.recommended.rules,
      "no-unused-vars": "off", // Use @typescript-eslint version
      "no-redeclare": "off", // TS handles overloads
      "no-empty": ["error", { allowEmptyCatch: true }],
      "vue/multi-word-component-names": "off",
      "vue/no-v-html": "off",
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],
      "no-undef": "off", // TypeScript/Vue handles this
    },
  },

  // CommonJS files
  {
    files: ["**/*.cjs"],
    languageOptions: {
      ecmaVersion: "latest",
      sourceType: "commonjs",
      globals: {
        console: "readonly",
        process: "readonly",
        __dirname: "readonly",
        __filename: "readonly",
        module: "readonly",
        require: "readonly",
        exports: "readonly",
      },
    },
    rules: {
      ...js.configs.recommended.rules,
    },
  },
];
