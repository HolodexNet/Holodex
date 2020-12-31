module.exports = {
    root: true,
    env: {
        browser: true,
        node: true,
        es6: true,
    },
    extends: ["airbnb-base", "eslint:recommended", "prettier", "prettier/vue"],
    parser: "vue-eslint-parser",
    parserOptions: {
        parser: "babel-eslint",
    },
    rules: {
        "no-console": process.env.NODE_ENV === "production" ? "warn" : "off",
        "no-debugger": process.env.NODE_ENV === "production" ? "warn" : "off",
        indent: ["error", 4, { SwitchCase: 1 }],
        quotes: ["error", "double", { avoidEscape: true }],
        eqeqeq: "error",
        "max-len": [
            "warn",
            {
                code: 120,
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
                vue: "never",
            },
        ],
    },
    settings: {
        "import/resolver": {
            alias: {
                map: [["@", "./src"]],
                extensions: [".js", ".vue"],
            },
            webpack: {
                // https://github.com/vuejs/vue-cli/issues/2628
                config: require.resolve("@vue/cli-service/webpack.config.js"),
            },
        },
    },
};
