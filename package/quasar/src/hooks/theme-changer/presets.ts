import { ThemeDefinition } from "vuetify";
import { Theme } from "./helpers";

export const presets: [{ name: string } & ThemeDefinition] = [
    {
        name: 'aqua',
        dark: true,
        colors: {
            background: '#1f1f1f',
            surface: '#3e2e2e',
            primary: '#3b88d5',
            secondary: '#F06292',
            error: '#B00020',
            info: '#64B5F6',
            success: '#4CAF50',
            warning: '#FB8C00',
        }
    },
]