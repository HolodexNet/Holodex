import { App, Directive } from "vue";
// import linkifyHtml from "linkify-html";
// import { Options } from "linkifyjs";
// import xss from "xss";
import linkify from "html-linkify";

// const linkify = (rawHtml: string, options: Options): string => {
//   const sanitized = xss(rawHtml);
//   return linkifyHtml(sanitized, options);
// };

const directive: Directive = {
  beforeMount(element: HTMLElement, binding) {
    element.innerHTML = linkify(element.innerHTML, binding.value);
  },
  updated(element: HTMLElement, binding) {
    element.innerHTML = linkify(element.innerHTML, binding.value);
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
