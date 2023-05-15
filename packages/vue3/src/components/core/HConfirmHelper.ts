import { VNode, createVNode, render } from "vue";
import HConfirm from "./HConfirm.vue";

/**
 * The options for creating a new component.
 */
interface CreateComponentOptions {
  /**
   * An object containing key-value pairs for each prop that the component has.
   */
  props?: any;
  /**
   * An array of child elements that should be rendered inside the component.
   */
  children?: any[];
  /**
   * The HTML element that the component should be rendered into.
   */
  element?: HTMLElement;
  /**
   * The root app instance that the component belongs to. This is used to bind the component's appContext
   * to the Vue app, defaults to the Vue app being called, so no need to specify.
   */
  app?: any;
}

/**
 * Mounts a component onto an element and returns a destroy method.
 *
 * @param {Object} component - the component to be created/mounted.
 * @param {Object} [options={}] - optional arguments.
 * @param {Object} [options.props] - props to be passed onto the component, this can include HTML attributes like id or class.
 * @param {Array} [options.children] - components to be rendered as children of component.
 * @param {HTMLElement} [options.element] - if specified, the element to mount the component into, if not specified, a div will be created.
 * @param {Object} [options.app] - the Vue app instance from createApp, if provided will be bound to the component's appContext.
 * @return {Object} An object with the following properties:
 *  - {Object} vNode - the created virtual node.
 *  - {Function} destroy - method to remove the component from the DOM.
 *  - {HTMLElement} el - the element that the component is mounted on.
 */
export function mount(
  component: any,
  { props, children, element, app }: CreateComponentOptions = {}
) {
  let el: HTMLElement | undefined = element;

  let vNode: VNode | undefined = createVNode(component, props, children);
  if (app && app._context) vNode.appContext = app._context;
  if (el) render(vNode, el);
  else if (typeof document !== "undefined")
    render(vNode, (el = document.createElement("div")));

  const destroy = () => {
    if (el) render(null, el);
    el = undefined;
    vNode = undefined;
  };

  return { vNode, destroy, el };
}

interface UseConfirmOptions {
  // persistent?: boolean; (Confirm Modals are always persistent)
  width?: string | number;
  maxWidth?: string | number;

  title?: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;

  /** hook if cancelled. If not provided, the open method will still provide an async promise. */
  cancelFn?: () => void;
  /** hook if confirmed. If not provided, the open method will still provide an async promise. */
  confirmFn?: () => void;
}
/**
 * Returns an object with a single method `open` that displays a confirmation dialog box.
 *
 * @param {UseConfirmOptions} globalProps - default options for the confirmation box.
 * @returns {object} - an object with a single method `open` that displays a confirmation dialog box.
 */
export const useConfirm = (globalProps: UseConfirmOptions) => {
  return {
    async open(options: UseConfirmOptions) {
      const { cancelFn, confirmFn, ...props } = Object.assign(
        {},
        globalProps,
        options
      );
      const opts: UseConfirmOptions = props;

      const promise = new Promise<boolean>((resolve, reject) => {
        let destroy: null | (() => void) = null;

        function onDismiss() {
          setTimeout(() => {
            destroy?.();
          }, 100);
        }
        opts.cancelFn = () => {
          cancelFn?.();
          resolve(false);
          onDismiss();
        };
        opts.confirmFn = () => {
          confirmFn?.();
          resolve(true);
          onDismiss();
        };

        const instance = mount(HConfirm, {
          props: opts,
          element: document.body,
        });
        destroy = instance.destroy;
      });

      return promise;
    },
  };
};
