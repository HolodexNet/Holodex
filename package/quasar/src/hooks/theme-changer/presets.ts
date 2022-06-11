import { ThemeDefinition } from "vuetify";
import { Theme } from "./helpers";

export const presets: object & ThemeDefinition = [
    {
        name: 'aqua',
        dark: true,
        colors: {
            background: '#FFFFFF',
            surface: '#FFFFFF',
            primary: '#6200EE',
            secondary: '#03DAC6',
            error: '#B00020',
            info: '#2196F3',
            success: '#4CAF50',
            warning: '#FB8C00',
        }
    },
]