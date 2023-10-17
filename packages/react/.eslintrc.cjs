module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react-hooks/recommended',
    'plugin:tailwindcss/recommended',
  ],
  plugins: ['react-refresh'],
  settings: {
    tailwindcss: {
      "whitelist": [
        'i\\-.+:?.+',
        // doesn't work see: [https://github.com/francoismassart/eslint-plugin-tailwindcss/issues/284]
      ],
    },
  },

  ignorePatterns: ['dist', '.eslintrc.cjs'],

  parser: '@typescript-eslint/parser',
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: ['./tsconfig.json', './tsconfig.node.json'],
    tsconfigRootDir: __dirname,
  },

  rules: {
    'react-refresh/only-export-components': [
      'warn',
      { allowConstantExport: true },
    ],
    '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
    "tailwindcss/no-custom-classname": ['warn']
  },
}
