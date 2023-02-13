import { App, Directive } from "vue";
import xss from "xss";
import linkifyHtml from "html-linkify";

type LinkifyOptions = Parameters<typeof linkifyHtml>["1"];
const linkify = (rawHtml: string, options: LinkifyOptions): string => {
  const sanitized = xss(rawHtml);
  return linkifyHtml(sanitized, options);
};

const directive: Directive<HTMLElement, LinkifyOptions> = {
  beforeMount(element: HTMLElement, binding) {
    element.innerHTML = linkify(element.textContent || "", binding.value);
  },
  updated(element: HTMLElement, binding) {
    element.innerHTML = linkify(element.textContent || "", binding.value);
  },
};

const mixin = {
  directives: { Linkify: directive },
};

const plugin = {
  install(app: App) {
    app.directive("linkify", directive);
  },
};

export { directive, mixin };
export default plugin;
