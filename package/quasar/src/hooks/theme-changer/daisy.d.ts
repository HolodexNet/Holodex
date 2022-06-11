declare module 'daisyui/src/colors/functions.js' {
    type PartialExcept<T, K extends keyof T> = Pick<T, K> & Partial<Omit<T, K>>;

    type x = {
        primary: "--p",
        "primary-focus": "--pf",
        "primary-content": "--pc",

        secondary: "--s",
        "secondary-focus": "--sf",
        "secondary-content": "--sc",

        accent: "--a",
        "accent-focus": "--af",
        "accent-content": "--ac",

        neutral: "--n",
        "neutral-focus": "--nf",
        "neutral-content": "--nc",

        "base-100": "--b1",
        "base-200": "--b2",
        "base-300": "--b3",
        "base-content": "--bc",

        info: "--in",
        "info-content": "--inc",

        success: "--su",
        "success-content": "--suc",

        warning: "--wa",
        "warning-content": "--wac",

        error: "--er",
        "error-content": "--erc",
    };
    export type DaisyColorName = keyof x
    export type DaisyColorShorthand = x[DaisyColorName]

    export type DaisyColorConfig = PartialExcept<Record<DaisyColorName, string>, 'primary' | 'secondary' | 'accent' | 'neutral' | 'base-100'>

    function convertToHsl(obj: DaisyColorConfig):
        Record<DaisyColorShorthand, string>;
}

