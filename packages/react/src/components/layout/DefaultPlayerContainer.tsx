import { miniPlayerAtom, playerLocationRefAtom } from "@/store/player";
import clsx from "clsx";
import { useAtomValue } from "jotai";
import React, { Suspense } from "react";
// import ReactPlayer from "react-player";
import { useLocation } from "react-router-dom";
import { Loading } from "../common/Loading";
import { useFloating, autoUpdate } from "@floating-ui/react-dom";
import { size, offset } from "@floating-ui/react-dom";

/* 
  ┌────────────────────────────────────────────────────────────────────────────┐
  │ Deprecated code, no longer using floating player container.                │
  │                                                                            │
  └────────────────────────────────────────────────────────────────────────────┘
 */
export const LazyReactPlayer = React.lazy(() => import("react-player"));

export const DefaultPlayerContainer = React.memo(() => {
  const anchor = useAtomValue(playerLocationRefAtom);
  const page = useLocation();
  const miniPlayer = useAtomValue(miniPlayerAtom);

  const { refs, floatingStyles } = useFloating({
    strategy: "fixed",
    placement: "bottom",
    elements: {
      reference: anchor,
    },
    middleware: [
      size({
        apply({ rects, elements }) {
          Object.assign(elements.floating.style, {
            width: `${rects.reference.width}px`,
            height: `${rects.reference.height}px`,
          });
        },
      }),
      offset(({ rects }) => {
        return -rects.reference.height / 2 - rects.floating.height / 2;
      }),
    ],
    whileElementsMounted: autoUpdate,
  });

  if (
    page.pathname.startsWith("/watch") ||
    page.pathname.startsWith("/edit") ||
    miniPlayer
  )
    return (
      <div
        className={clsx([
          "fixed",
          page.pathname.startsWith("/watch") ||
          page.pathname.startsWith("/edit") ||
          miniPlayer
            ? "z-10"
            : "-z-10 hidden",
        ])}
        ref={refs.setFloating}
        style={floatingStyles}
      >
        <Suspense fallback={<Loading size="xl" />}>
          {/* <PlayerWrapper></PlayerWrapper> */}
        </Suspense>
      </div>
    );
});
