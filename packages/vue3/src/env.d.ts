/// <reference types="vite/client" />

declare module "*.vue" {
  import { DefineComponent } from "vue";
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/ban-types
  const component: DefineComponent<{}, {}, any>;
  export default component;
}

declare module "oauth-open";

declare module "html-linkify" {
  /**
   *
   * @param text HTML to linkify
   * @param options options object. attributes: a mapping of attrs to be added to generated anchors; escape: whether surrounding HTML tags should be escaped or not (default true)
   */
  export default function linkify(
    text: string,
    options: { attributes: Record<string, string>; escape?: boolean },
  ): string;
}
