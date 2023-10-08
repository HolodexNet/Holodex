# React + TypeScript + Vite

## Holodex V3 React Rewrite

### Design guidelines:

**Business Logic Stack Breakdown:**
- `jotai` is used for state management.
  - it is an atomic state management library for React, and supports both persisting to LocalStorage. We have our own version that also Broadcasts updates to other clients.
- `@tanstack/react-query` is used for API calls.


**UI Styling Stack Breakdown:**
- Shadcn/ui components. These are basically copy pasted in, but there's a shadcn setup CLI tool you can `npx shadcn-ui <init | add | diff | help>...` to add new components in.
- Tailwind Utility CSS classes.
- Radix Colors applied to tailwind, with some semantic css colors for theme-control
- the combination of the Shadcn and Radix Colors requires **fixing of the imported Shadcn components**, esp about their colors!
- UNOCSS presets for icon provided via iconify. Please install iconify json libraries separately though as you use them
  - when upgrading iconify, make sure to bump: `@iconify/json`, `unocss`, all at the same time.
  - UNOCSS essentially extracts icons from class names as we use them and provides a css of only the icons we use.

## Getting Started
This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type aware lint rules:

- Configure the top-level `parserOptions` property like this:

```js
   parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module',
    project: ['./tsconfig.json', './tsconfig.node.json'],
    tsconfigRootDir: __dirname,
   },
```

- Replace `plugin:@typescript-eslint/recommended` to `plugin:@typescript-eslint/recommended-type-checked` or `plugin:@typescript-eslint/strict-type-checked`
- Optionally add `plugin:@typescript-eslint/stylistic-type-checked`
- Install [eslint-plugin-react](https://github.com/jsx-eslint/eslint-plugin-react) and add `plugin:react/recommended` & `plugin:react/jsx-runtime` to the `extends` list
