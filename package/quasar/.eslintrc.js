module.exports = {
  env: {
    node: true,
    "vue/setup-compiler-macros": true,
  },
  extends: ["eslint:recommended", "plugin:vue/vue3-recommended", "prettier"],

  rules: {
    // override/add rules settings here, such as:
    // 'vue/no-unused-vars': 'error'
  },
};
