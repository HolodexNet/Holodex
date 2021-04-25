module.exports = {
    presets: ["@vue/cli-plugin-babel/preset", "@babel/preset-flow"],
    plugins: [
        "@interactjs/dev-tools/babel-plugin-prod",
        "@babel/plugin-proposal-nullish-coalescing-operator",
        "@babel/plugin-proposal-optional-chaining",
    ],
};
