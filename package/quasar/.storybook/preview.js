// Import icon libraries
import "@quasar/extras/material-icons/material-icons.css";

// Import Quasar css
import "quasar/src/css/index.sass";
import { app } from "@storybook/vue3";
import { Quasar } from "quasar";

app.use(Quasar, {
  plugins: {}, // import Quasar plugins and add here
});

export const parameters = {
  actions: { argTypesRegex: "^on[A-Z].*" },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
};
