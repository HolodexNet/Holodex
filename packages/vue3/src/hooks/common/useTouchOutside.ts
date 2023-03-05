import { unrefElement } from "@vueuse/core";

export default function useTouchOutside(
  target: Ref<HTMLElement | null>,
  fn: (e: TouchEvent) => void
) {
  const el = unrefElement(target);
  const listener = (event: TouchEvent) => {
    if (!el || el === event.target || event.composedPath().includes(el)) return;
    fn(event);
    window.removeEventListener("touchstart", listener);
  };
  window.addEventListener("touchstart", listener, { passive: true });
}
