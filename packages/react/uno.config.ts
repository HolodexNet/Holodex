import {
  defineConfig,
  presetIcons,
  presetUno,
  presetWebFonts,
  transformerDirectives,
  transformerVariantGroup,
} from "unocss";

// import presetAutoprefixer from 'unocss-preset-autoprefixer'
export default defineConfig({
  presets: [
    presetIcons({
      scale: 1.25,
      unit: "em",
    }),
    // presetWebFonts({
    //   fonts: {
    //     sans: 'Roboto',
    //     mono: ['Fira Code', 'Fira Mono:400,700'],
    //   },
    // }),
    // presetAutoprefixer(),
  ],
  variants: presetUno().variants, // this brings in the :hover utility for UNOCSS icons.
});
