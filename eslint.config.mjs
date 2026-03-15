import globals from "globals";
import tsParser from "@typescript-eslint/parser";
import security from "eslint-plugin-security";
import unicornPlugin from "eslint-plugin-unicorn";
import promise from "eslint-plugin-promise";
import jsdocPlugin from "eslint-plugin-jsdoc";
import md from "eslint-plugin-md";
import json from "eslint-plugin-json";
import chaiFriendly from "eslint-plugin-chai-friendly";
import prettierConfig from "eslint-config-prettier";
import prettierPlugin from "eslint-plugin-prettier";
import n from "eslint-plugin-n";
import eslintComments from "@eslint-community/eslint-plugin-eslint-comments";
import markdownParser from "markdown-eslint-parser";

export default [
  // Global ignores (replaces .eslintignore)
  {
    ignores: [
      ".nyc_output/**/*",
      "node_modules/**/*",
      "target/**/*",
      "coverage/**",
      "test-results/**",
      "lib/**/*",
      "dist/**",
      ".env",
      "out",
      "report/**/*",
    ],
  },

  // JSON files
  json.configs.recommended,

  // Base config for JS/TS files
  {
    files: ["**/*.js", "**/*.ts"],
    languageOptions: {
      parser: tsParser,
      parserOptions: {
        sourceType: "module",
      },
      globals: {
        ...globals.node,
        Promise: true,
        Readonly: true,
      },
    },
    plugins: {
      security,
      unicorn: unicornPlugin,
      promise,
      jsdoc: jsdocPlugin,
      n,
      "@eslint-community/eslint-comments": eslintComments,
      prettier: prettierPlugin,
    },
    rules: {
      // Spread recommended configs
      ...security.configs.recommended.rules,
      ...unicornPlugin.configs["flat/recommended"].rules,
      ...jsdocPlugin.configs["flat/recommended"].rules,
      ...promise.configs["flat/recommended"].rules,
      ...prettierConfig.rules,

      // Custom rule overrides
      "promise/no-callback-in-promise": "off",
      "security/detect-object-injection": "off",
      "unicorn/no-array-reduce": "off",
      "unicorn/prefer-module": "off",
      "unicorn/prefer-node-protocol": "off",
      "unicorn/prefer-string-replace-all": "off",
      "unicorn/explicit-length-check": "off",
      "unicorn/numeric-separators-style": "off",
      // New rules in unicorn v63 - disable to keep behavior parity
      "unicorn/no-typeof-undefined": "off",
      "unicorn/no-negated-condition": "off",
      "unicorn/no-useless-fallback-in-spread": "off",
      "unicorn/require-number-to-fixed-digits-argument": "off",
      "unicorn/no-array-for-each": "off",
      "unicorn/consistent-assert": "off",
    },
  },

  // Test files override
  {
    files: ["src/test/**/*.js", "src/test/**/*.ts", "cucumber.js"],
    plugins: {
      "chai-friendly": chaiFriendly,
    },
    languageOptions: {
      globals: {
        expect: true,
        PendingError: true,
      },
    },
    rules: {
      ...chaiFriendly.configs.recommendedFlat.rules,
      "security/detect-non-literal-fs-filename": "off",
      "jsdoc/require-jsdoc": "off",
      "security/detect-object-injection": "off",
      "unicorn/no-array-callback-reference": "off",
      "unicorn/prefer-module": "off",
      "unicorn/prefer-node-protocol": "off",
      "unicorn/prefer-string-replace-all": "off",
      "unicorn/explicit-length-check": "off",
      "unicorn/numeric-separators-style": "off",
    },
  },

  // TypeScript files: use jsdoc typescript-aware rules
  // jsdoc v50 recommended didn't flag TS files; v62 does.
  // Use recommended-typescript and disable require-jsdoc to match old behavior.
  {
    files: ["**/*.ts"],
    rules: {
      ...jsdocPlugin.configs["flat/recommended-typescript"].rules,
      "jsdoc/require-jsdoc": "off",
      "jsdoc/require-param-description": "off",
      "jsdoc/require-returns": "off",
      "jsdoc/check-param-names": "off",
    },
  },

  // Scripts override
  {
    files: ["scripts/**/*.js"],
    languageOptions: {
      parserOptions: {
        sourceType: "module",
        allowImportExportEverywhere: true,
      },
    },
  },

  // Markdown files
  {
    files: ["**/*.md"],
    plugins: {
      md,
    },
    languageOptions: {
      parser: markdownParser,
    },
    rules: {
      "unicorn/filename-case": "off",
      "md/remark": [
        "error",
        {
          plugins: {
            "remark-lint-maximum-line-length": ["error", 80],
          },
        },
      ],
    },
  },
];
