import {
  defineConfig, presetIcons,
  presetWebFonts,
  transformerDirectives, transformerVariantGroup,
} from 'unocss'

// import presetAutoprefixer from 'unocss-preset-autoprefixer'
export default defineConfig({
  presets: [
    presetIcons(),
    // presetWebFonts({
    //   fonts: {
    //     sans: 'Roboto',
    //     mono: ['Fira Code', 'Fira Mono:400,700'],
    //   },
    // }),
    // presetAutoprefixer(),
  ],
})