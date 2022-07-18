export const getKeyValue = (obj: Record<string, any>) => (key: string) =>
  obj[key];

export const genId = (): string =>
  "theme-" + Math.random().toString(36).substring(2, 12);

export const prefersDarkMode = (): boolean =>
  window.matchMedia &&
  window.matchMedia("(prefers-color-scheme: dark)").matches;

export const prefersLightMode = (): boolean =>
  window.matchMedia &&
  window.matchMedia("(prefers-color-scheme: light)").matches;
