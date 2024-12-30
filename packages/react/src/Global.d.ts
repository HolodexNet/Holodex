declare module "*.module.css" {
  const classes: { [key: string]: string };
  export default classes;
}

declare module "*.module.scss" {
  const classes: { [key: string]: string };
  export default classes;
}

declare module "*.module.sass" {
  const classes: { [key: string]: string };
  export default classes;
}

declare module "*.module.less" {
  const classes: { [key: string]: string };
  export default classes;
}

declare module "*.module.styl" {
  const classes: { [key: string]: string };
  export default classes;
}

declare module "jsonp-es6" {
  /**
   * Makes a JSONP request to the specified URL with the given parameters
   * @param url The base URL to make the request to
   * @param params Request query parameters
   * @returns A promise that resolves with the JSONP response
   */
  export default function jsonp<T>(url: string, body?: Record): Promise<T>;
}
