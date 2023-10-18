# Holodex

## Overview

### Design guidelines:

**Business Logic Stack Breakdown:**

- `jotai` is used for state management.
  - it is an atomic state management library for React, and supports both persisting to LocalStorage. We have our own version that also Broadcasts updates to other clients.
- `@tanstack/react-query` is used for API calls.

**UI Styling Stack Breakdown:**

- [Shadcn/ui components](https://ui.shadcn.com/docs/components/accordion). There's a shadcn setup CLI tool you can `npx shadcn-ui <init | add | diff | help>...` to add new components in.
- Tailwind Utility CSS classes.
- [Radix Colors](https://www.radix-ui.com/colors/docs/palette-composition/understanding-the-scale) applied to tailwind, with some semantic css colors for theme-control
- the combination of the [Shadcn](https://ui.shadcn.com/docs/components/accordion) and [Radix Colors](https://www.radix-ui.com/colors/docs/palette-composition/understanding-the-scale) requires **fixing of the imported Shadcn components**, esp about their colors!
- UNOCSS presets for icon provided via [iconify](https://icon-sets.iconify.design/).
  - They are sized using line-height/font-size, so you need to adjust the line-height of the div element like so: `<div className="i-heroicons:sun-solid text-xl" />`
  - when upgrading iconify, make sure to bump: `@iconify/json`, `unocss`, all at the same time.
  - UNOCSS essentially extracts icons from class names as we use them and provides a css of only the icons we use.

## Getting Started

This is a refresh of Holodex using React as the underlying mechanism. We want to use smaller components and be less dependent on external libraries this time around, especially taking in the lessons learned from depending on Vuetify too much in the Vue version.

To install and run:

```bash
npm install

npm run dev
```

## Contributing

We welcome all contributors, but encourage participants to first register for a discord account and join us on the Holodex discord server. This way it will be easier to communicate about project status, feature ideas, and reduce overhead.

The goals of the repository in the long term:

- [ ] Migrate all Holodex V2 features to Holodex V3
  - [ ] HomePage
  - [ ] Favorites Page
  - [ ] Search
  - [ ] Profile
  - [ ] Settings
  - [ ] About
  - [ ] TLDex
  - [ ] Editing Components
- [ ] Migrate components to our own Shadcn-Radix variant
  - [ ] Kitchensink Page

## Notes

#### We're using the SWC plugin currently for HMR, but if anything breaks, we recommend switching to the slower Babel plugin.

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

#### Expanding the ESLint configuration

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
