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
export * from "@tanstack/virtual-core";

function useVirtualizerBase<TScrollElement, TItemElement = unknown>(
  options: VirtualizerOptions<TScrollElement, TItemElement>
): Virtualizer<TScrollElement, TItemElement> {
  const instance = new Virtualizer<TScrollElement, TItemElement>(options);

  // the setup for the virtualizer, most crucially for us:
  //
  return instance;

  // the response of the virtualizer provides several values:
  instance.scrollToIndex; //<-- fn to trigger a scroll.
  instance.scrollElement; //<-- the element being scrolled, Readonly.
  instance.getVirtualItems; // () => VirtualItems <-- you should render these virtual items.

  /**
   * In react: it looks like:
   * {rowVirtualizer.getVirtualItems().map((virtualRow) => (
            <div
              key={virtualRow.index}
            ref={virtualRow.measureElement} <-- this is pretty important, 
                                            as it feeds back the height of the 
                                            element to the renderer.
              className={virtualRow.index % 2 ? 'ListItemOdd' : 'ListItemEven'}
              style={{
                position: 'absolute', top: 0, left: 0, width: '100%',
                height: `${virtualRow.size}px`,
                transform: `translateY(${virtualRow.start}px)`,
              }}
            >
              Row {virtualRow.index}
            </div>
          ))}

   */

  instance.getTotalSize; // () => size of total space:

  /**
           * In React: use this to wrap the above getVirtualItems.
           *       <div
        ref={parentRef}
        className="List"
        style={{
          height: `200px`,width: `400px`,overflow: 'auto',
        }}
      >
        <div
          style={{
            height: rowVirtualizer.getTotalSize(), <-- Here we get total size.
            width: '100%',position: 'relative',
          }}
        >
            * {rowVirtualizer.getVirtualItems().map((virtualRow) => (
                and so on and so on...
           */

  // in vue, the setup should be very similar, except the output should be reactive variables?
  // How does that work? So... To summarize:

  // for dynamic sizing, the row/item must report itself to a (Element) => void
  // callback fn called 'measureElement(el)' after rendering.

  // =================================================================
  // TLDR & IDEAS:

  // As the user scrolls, `observeElementRect(el, cb(rect) => void)`, and
  // `observeElementOffset(el, cb(rect) => void)` will fire callbacks
  // into the Virtualizer itself, which modifies the virtualizer.getVirtualItems(); output,
  // which, if the UI is reactively looking at it, will cause a redraw.

  // getVirtualItems should probably be a computed fn() which depends on
  // observeRect and observeElementOffset.
  //

  // maybe if the offset changes..., it'll cause a sideeffect for getVirtualItems to fire?
  // =============================
}

export function useVirtualizer<TScrollElement, TItemElement = unknown>(
  options: PartialKeys<
    VirtualizerOptions<TScrollElement, TItemElement>,
    "observeElementRect" | "observeElementOffset" | "scrollToFn"
  >
): Virtualizer<TScrollElement, TItemElement> {
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
): Virtualizer<Window, TItemElement> {
  return useVirtualizerBase<Window, TItemElement>({
    getScrollElement: () => (typeof window !== "undefined" ? window : null!),
    observeElementRect: observeWindowRect,
    observeElementOffset: observeWindowOffset,
    scrollToFn: windowScroll,
    ...options,
  });
}
