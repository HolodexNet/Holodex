module.exports = {
  root: true,
  env: { browser: true, es2020: true },
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:react-hooks/recommended",
    "plugin:tailwindcss/recommended",
    "prettier",
  ],
  plugins: ["react-refresh", "prettier"],
  settings: {
    tailwindcss: {
      callees: ["cn"],
      whitelist: [
        "i\\-.+:?.+",
        // doesn't work see: [https://github.com/francoismassart/eslint-plugin-tailwindcss/issues/284]
      ],
    },
  },

  ignorePatterns: [
    "dist",
    ".eslintrc.cjs",
    "index.html",
    "tailwind.config.js",
    "postcss.config.js",
    "uno.config.ts",
    "src/components/tldex/new-editor/support",
    "node_modules",
    ".DS_Store",
    "dist",
    "dist-ssr",
    "*.local",
    "components.d.ts",
    "gource/*",
    "gource",
    "public/*.js",
    "public/*.js.map",
    "src/shadcn/ui/*"
  ],

  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: "latest",
    sourceType: "module",
    project: ["./tsconfig.json", "./tsconfig.node.json"],
    tsconfigRootDir: __dirname,
  },

  rules: {
    "prettier/prettier": 2, // Means error
    "react-refresh/only-export-components": [
      "warn",
      { allowConstantExport: true },
    ],
    "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
    "tailwindcss/no-custom-classname": [
      "warn",
      {
        whitelist: [
          "i-[a-zA-Z-]+:[a-zA-Z0-9-]+", // iconify classes
          "\\S+-(base|primary|secondary)-[0-9]{1,2}", // custom colors
          "@.+:?.+", // @tailwindcss/container-queries classes
        ],
      },
    ],
  },
};
