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
        indent: ["error", 4],
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
    },
    settings: {
        "import/resolver": {
            alias: {
                map: [["@", "./src"]],
                extensions: [".js", ".vue"],
            },
        },
    },
};
