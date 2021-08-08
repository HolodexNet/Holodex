module.exports = {
    root: true,

    env: {
        browser: true,
        node: true,
        es6: true,
    },

    extends: ["plugin:vue/recommended", "airbnb-base", "eslint:recommended", "@vue/typescript"],
    parser: "vue-eslint-parser",

    parserOptions: {
        parser: "@typescript-eslint/parser",
        sourceType: "module",
    },
    rules: {
        "no-console": process.env.NODE_ENV === "production" ? "warn" : "off",
        "no-debugger": process.env.NODE_ENV === "production" ? "warn" : "off",
        quotes: ["error", "double", { avoidEscape: true }],
        eqeqeq: "error",
        "max-len": [
            "warn",
            {
                code: 200,
                ignoreTemplateLiterals: true,
                ignoreStrings: true,
                ignoreUrls: true,
            },
        ],
        "no-param-reassign": ["error", { props: false }],
        "no-restricted-syntax": "off",
        "no-await-in-loop": "off",
        "no-unused-expressions": ["error", { allowShortCircuit: true, allowTernary: true }],
        "import/extensions": [
            "error",
            "always",
            {
                js: "never",
                ts: "never",
                vue: "always",
            },
        ],
        "vue/no-v-html": "off",
        indent: "off",
        "vue/script-indent": ["error", 4, { baseIndent: 0, switchCase: 1 }],
        "linebreak-style": "off",
        "vue/max-attributes-per-line": [
            "error",
            {
                singleline: {
                    max: 3,
                    allowFirstLine: true,
                },
            },
        ],
        "nonblock-statement-body-position": ["warn", "any"],
        "vue/html-indent": ["error", 2],
        "vue/require-default-prop": "off",
        "vue/script-setup-uses-vars": "off"
    },

    ignorePatterns: ["src/external/**", "src/locales/**", ".eslintrc.js", "*.config.js"],

    settings: {
        "import/resolver": {
            alias: {
                map: [["@", "./src"]],
                extensions: [".js", ".vue", ".ts"],
            }
        },
    },
};
