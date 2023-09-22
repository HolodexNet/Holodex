import {
  defineConfig, presetIcons,
  presetTypography, presetWebFonts,
  transformerDirectives, transformerVariantGroup,
  presetWind,
} from 'unocss'
import presetAutoprefixer from 'unocss-preset-autoprefixer'
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
    // presetWind(),
    presetIcons(),
    // presetShadcn(),
    // presetTypography(),
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