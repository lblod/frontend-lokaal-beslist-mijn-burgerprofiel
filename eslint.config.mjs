import ember from "eslint-plugin-ember";
import typescriptEslint from "@typescript-eslint/eslint-plugin";
import globals from "globals";
import tsParser from "@typescript-eslint/parser";
import path from "node:path";
import { fileURLToPath } from "node:url";
import js from "@eslint/js";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

export default [
  {
    ignores: [
      "blueprints/*/files/",
      "vendor/",
      "dist/",
      "tmp/",
      "bower_components/",
      "node_modules/",
      "coverage/",
      "!**/.*",
      "**/.*/",
      "**/.eslintcache",
      ".node_modules.ember-try/",
      "bower.json.ember-try",
      "npm-shrinkwrap.json.ember-try",
      "package.json.ember-try",
      "package-lock.json.ember-try",
      "yarn.lock.ember-try",
      ".prettierrc.js",
      ".stylelintrc.js",
      ".template-lintrc.js",
      "environment.js",
      "targets.js",
      "ember-cli-build.js",
      "testem.js",
      "config/environment.js",
      "config/targets.js",
    ],
  },
  ...compat.extends(
    "eslint:recommended",
    "plugin:ember/recommended",
    "plugin:prettier/recommended",
  ),
  {
    plugins: {
      ember,
      "@typescript-eslint": typescriptEslint,
    },

    languageOptions: {
      globals: {
        ...globals.browser,
      },

      parser: tsParser,
      ecmaVersion: "latest",
      sourceType: "module", // Adjust to "module" if using ES Modules
    },
    rules: {
      "@typescript-eslint/consistent-type-imports": [
        "error",
        { prefer: "type-imports" },
      ],
    },
  },
  ...compat
    .extends(
      "plugin:@typescript-eslint/eslint-recommended",
      "plugin:@typescript-eslint/recommended",
    )
    .map((config) => ({
      ...config,
      files: ["**/*.ts"],
    })),
  ...compat.extends("plugin:n/recommended").map((config) => ({
    ...config,

    files: [
      "./.eslintrc.js",
      "./.prettierrc.js",
      "./.stylelintrc.js",
      "./.template-lintrc.js",
      "./ember-cli-build.js",
      "./testem.js",
      "./blueprints/*/index.js",
      "./lib/*/index.js",
      "./server/**/*.js",
    ],
  })),
  {
    files: [
      "./.eslintrc.js",
      "./.prettierrc.js",
      "./.stylelintrc.js",
      "./.template-lintrc.js",
      "./ember-cli-build.js",
      "./testem.js",
      "./blueprints/*/index.js",
      "./lib/*/index.js",
      "./server/**/*.js",
    ],

    languageOptions: {
      globals: {
        ...Object.fromEntries(
          Object.entries(globals.browser).map(([key]) => [key, "off"]),
        ),
        ...globals.node,
      },

      ecmaVersion: 5,
      sourceType: "commonjs",
    },
  },
  ...compat.extends("plugin:qunit/recommended").map((config) => ({
    ...config,
    files: ["tests/**/*-test.{js,ts}"],
  })),
  {
    files: ["tests/**/*-test.{js,ts}"],
    rules: {
      "qunit/require-expect": "off",
    },
  },
];
