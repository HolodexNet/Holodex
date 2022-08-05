module.exports = {
  root: true,
  env: {
    node: true,
    "vue/setup-compiler-macros": true,
  },
  extends: [
    "plugin:vue/vue3-essential", // vue3-essential is for vue 3, vue/essential is for vue2.
    "plugin:vue/vue3-recommended",
    "@vue/typescript/recommended",
    "./.eslintrc-auto-import.json",
    "prettier",
  ],
  parserOptions: {
    parser: "@typescript-eslint/parser",
    sourceType: "module",
    ecmaVersion: 2021,
  }, // "parser": {
  //   // Script parser for `<script>`
  //   "js": "espree",

  //   // Script parser for `<script lang="ts">`
  //   "ts": "@typescript-eslint/parser",

  //   // Script parser for vue directives (e.g. `v-if=` or `:attribute=`)
  //   // and vue interpolations (e.g. `{{variable}}`).
  //   // If not specified, the parser determined by `<script lang ="...">` is used.
  //   "<template>": "espree",
  // }
  // },

  settings: {
    "import/resolver": {
      alias: {
        map: [["@", "./src"]],
        extensions: [".js", ".vue", ".ts"],
      },
    },
  },
  ignorePatterns: ["./components.d.ts", "./src/auto-imports.d.ts"],

  rules: {
    "brace-style": [2, "1tbs", { allowSingleLine: true }],

    // "vue/script-indent": ["error", 4, { baseIndent: 0, switchCase: 1 }],

    "vue/max-attributes-per-line": 0,
    "vue/valid-v-for": 0,
    "vue/no-multiple-template-root": 0,
    "vue/no-v-for-template-key": 0,
    "vue/no-v-for-template-key-on-child": "error",
    "vue/multi-word-component-names": 0,
    // allow async-await
    "generator-star-spacing": "off",

    // allow paren-less arrow functions
    "arrow-parens": 0,
    "one-var": 0,

    "import/first": 0,
    "import/extensions": 0,
    "import/no-unresolved": 0,
    "import/no-extraneous-dependencies": 0,

    // allow debugger during development
    "no-debugger": process.env.NODE_ENV === "production" ? 2 : 0,
    "@typescript-eslint/no-explicit-any": 0,
    "@typescript-eslint/ban-ts-comment": 0,
  },
};
