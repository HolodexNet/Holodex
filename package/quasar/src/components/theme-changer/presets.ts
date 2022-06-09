import { Theme } from "./helpers";

export const themes: Theme[] = [
    // Light themes
    {
        name: 'quasarish',
        dark: false,
        colors: {
            primary: 'blue-8',
            secondary: 'teal-4',
            accent: 'purple-6',
            info: 'cyan-6',
            warning: 'amber-6',
            positive: 'green-14',
            negative: 'red-10'
        }
    },
    {
        name: 'sunset',
        dark: false,
        colors: {
            primary: 'deep-purple-9',
            secondary: 'orange-10',
            accent: 'light-green-7',
            info: 'cyan-9',
            warning: 'yellow-9',
            positive: 'green-9',
            negative: 'red-10'
        }
    },

    // Dark themes
    {
        name: 'pastels',
        dark: true,
        colors: {
            primary: 'pink-2',
            secondary: 'indigo-3',
            accent: 'lime-3',
            info: 'cyan-3',
            warning: 'orange-3',
            positive: 'green-13',
            negative: 'red-3'
        }
    },
    {
        name: 'ocean',
        dark: true,
        colors: {
            primary: 'green-2',
            secondary: 'teal-2',
            accent: 'purple-2',
            info: 'blue-3',
            warning: 'yellow-3',
            positive: 'light-green-3',
            negative: 'orange-3'
        }
    },
    {
        name: 'synthwave',
        dark: true,
        colors: {
            primary: 'purple-4',
            secondary: 'cyan-5',
            accent: 'yellow-14',
            info: 'cyan-2',
            warning: 'orange-13',
            positive: 'green-13',
            negative: 'deep-orange-5'
        }
    }
]