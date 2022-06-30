import {
  elementScroll,
  observeElementOffset,
  observeElementRect,
  observeWindowOffset,
  observeWindowRect,
  PartialKeys,
  Virtualizer,
  VirtualizerOptions,
  windowScroll,
} from "@tanstack/virtual-core";
import { Ref } from "vue";
export * from "@tanstack/virtual-core";

function useVirtualizerBase<TScrollElement, TItemElement = unknown>(
  options: VirtualizerOptions<TScrollElement, TItemElement>
): Ref<Virtualizer<TScrollElement, TItemElement>> {
  const virtualizer = reactive(
    new Virtualizer<TScrollElement, TItemElement>(options)
  );

  const rerenderRef = ref(0);

  onMounted(() => {
    virtualizer._didMount();
    virtualizer._willUpdate();
  });

  virtualizer.setOptions({
    ...options,
    onChange: (instance) => {
      requestAnimationFrame(() => {
        virtualizer._willUpdate();
        rerenderRef.value++;
        options.onChange?.(instance);
      });
    },
  });

  const instance = computed(() => {
    rerenderRef.value / 2;
    virtualizer.setOptions({
      ...options,
      onChange: (instance) => {
        requestAnimationFrame(() => {
          virtualizer._willUpdate();
          rerenderRef.value++;
          options.onChange?.(instance);
        });
      },
    });
    return virtualizer;
  });

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  return instance;
}

export function useVirtualizer<TScrollElement, TItemElement = unknown>(
  options: PartialKeys<
    VirtualizerOptions<TScrollElement, TItemElement>,
    "observeElementRect" | "observeElementOffset" | "scrollToFn"
  >
): Ref<Virtualizer<TScrollElement, TItemElement>> {
  return useVirtualizerBase<TScrollElement, TItemElement>({
    observeElementRect: observeElementRect,
    observeElementOffset: observeElementOffset,
    scrollToFn: elementScroll,
    ...options,
  });
}

export function useWindowVirtualizer<TItemElement = unknown>(
  options: PartialKeys<
    VirtualizerOptions<Window, TItemElement>,
    | "getScrollElement"
    | "observeElementRect"
    | "observeElementOffset"
    | "scrollToFn"
  >
): Ref<Virtualizer<Window, TItemElement>> {
  return useVirtualizerBase<Window, TItemElement>({
    getScrollElement: () => (typeof window !== "undefined" ? window : null!),
    observeElementRect: observeWindowRect,
    observeElementOffset: observeWindowOffset,
    scrollToFn: windowScroll,
    ...options,
  });
}
