import { ThemeDefinition } from "vuetify";
import { Theme } from "./helpers";

export const presets: [Theme] = [
    {
        name: 'aqua',
        dark: true,
        colors: {
            'base-100': '#1f1f1f',
            primary: '#3b88d5',
            neutral: '#758799',
            secondary: '#F06292',
            accent: '#F03284',
            error: '#B00020',
            info: '#64B5F6',
            success: '#4CAF50',
            warning: '#FB8C00',
        }
    },
]