import { Theme } from "./helpers";

export const presets: [Theme] = [
  {
    name: "aqua",
    dark: true,
    colors: {
      "base-100": "#222222",
      primary: "#F06292",
      neutral: "#758799",
      secondary: "#3b88d5",
      accent: "#F03284",
      error: "#B00020",
      info: "#64B5F6",
      success: "#4CAF50",
      warning: "#FB8C00",
    },
  },
];

/**
 * Additional Defaults for DaisyUI that will be applied globally.
 */
export const DaisyDefaults = {
  "--rounded-box": "0.25rem", // border radius rounded-box utility class, used in card and other large boxes
  "--rounded-btn": "0.25rem", // border radius rounded-btn utility class, used in buttons and similar element
  "--rounded-badge": "1.9rem", // border radius rounded-badge utility class, used in badges and similar
  "--animation-btn": "0.25s", // duration of animation when you click on button
  "--animation-input": "0.2s", // duration of animation for inputs like checkbox, toggle, radio, etc
  "--btn-text-case": "uppercase", // set default text transform for buttons
  "--btn-focus-scale": "0.95", // scale transform of button when you focus on it
  "--border-btn": "1px", // border width of buttons
  "--tab-border": "1px", // border width of tabs
  "--tab-radius": "0.5rem", // border radius of tabs
};
