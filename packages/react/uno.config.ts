import {
  defineConfig, presetIcons,
  presetWebFonts,
  transformerDirectives, transformerVariantGroup,
} from 'unocss'

// import presetAutoprefixer from 'unocss-preset-autoprefixer'
export default defineConfig({
  shortcuts: [
    // ...
  ],
  theme: {
    colors: {
      // ...
    }
  },
  presets: [
    presetIcons(),
    presetWebFonts({
      fonts: {
        sans: 'Roboto',
        mono: ['Fira Code', 'Fira Mono:400,700'],
      },
    }),
    // presetAutoprefixer(),
  ],
  transformers: [
    transformerDirectives(),
    transformerVariantGroup(),
  ],
})