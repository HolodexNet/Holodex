import {
  PlayingVideoState,
  QueueVideo,
  currentVideoAtom,
  defaultPlayerEventBus,
  miniPlayerAtom,
  playerLocationRefAtom,
  playerRefAtom,
  videoStatusAtomFamily,
} from "@/store/player";
import clsx from "clsx";
import { useAtomValue, useSetAtom } from "jotai";
import React, { Suspense } from "react";
// import ReactPlayer from "react-player";
import { useLocation } from "react-router-dom";
import { Loading } from "../common/Loading";
import type { OnProgressProps } from "react-player/base";
import { useFloating, autoUpdate } from "@floating-ui/react-dom";
import { size, offset } from "@floating-ui/react-dom";
import ReactPlayer from "react-player";

const LazyReactPlayer = React.lazy(() => import("react-player"));

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
          <PlayerWrapper></PlayerWrapper>
        </Suspense>
      </div>
    );
});
export const PlayerWrapper = ({
  currentVideo,
  customSetPlayerRef,
}: {
  currentVideo?: QueueVideo;
  customSetPlayerRef?: React.Ref<ReactPlayer>;
}) => {
  const setPlayerRef = useSetAtom(playerRefAtom);
  const currentVideo2 = useAtomValue(currentVideoAtom);

  const video = currentVideo ?? currentVideo2;

  const videoStatusAtom = videoStatusAtomFamily(video?.id || "x");
  const playingVideoStateSetter = useSetAtom(videoStatusAtom);
  // Assuming you have a way to access `set` for updating the atom
  const updateState = (update: Partial<PlayingVideoState>) => {
    playingVideoStateSetter((prev) => ({ ...prev, ...update }));
  };

  return (
    <LazyReactPlayer
      ref={customSetPlayerRef ?? setPlayerRef}
      // pass `key` to prevent flicker issue https://github.com/CookPete/react-player/issues/413#issuecomment-395404630
      key={currentVideo?.url}
      style={
        {
          // aspectRatio: "16 / 9", uncommenting this may cause the aspect ratio to lock on certain pages such as script editor
        }
      }
      // width="100%"
      width="auto"
      height="100%"
      url={video?.url}
      controls
      config={{
        youtube: {
          playerVars: {
            origin: window.origin,
            autoplay: 1,
          },
        },
      }}
            progressInterval={200}
      onStart={() => {
        defaultPlayerEventBus.emit("onStart", video?.id || "");
        updateState({ status: "playing" });
      }}
      onPlay={() => {
        defaultPlayerEventBus.emit("onPlay", video?.id || "");
        updateState({ status: "playing" });
      }}
      onPause={() => {
        defaultPlayerEventBus.emit("onPause", video?.id || "");
        updateState({ status: "paused" });
      }}
      onBuffer={() => {
        defaultPlayerEventBus.emit("onBuffer", video?.id || "");
        updateState({ status: "buffering" });
      }}
      onBufferEnd={() => {
        defaultPlayerEventBus.emit("onBufferEnd", video?.id || "");
      }}
      onClickPreview={(e: unknown) => {
        defaultPlayerEventBus.emit("onClickPreview", video?.id || "", e);
      }}
      onError={(a: unknown, b: unknown, c: unknown, d: unknown) => {
        defaultPlayerEventBus.emit("onError", video?.id || "", a, b, c, d);
        console.error("VIDEO PLAYER ERROR", video?.id, a, b, c, d);
        updateState({ error: { a, b, c, d } });
      }}
      onEnablePIP={() => {
        defaultPlayerEventBus.emit("onEnablePIP", video?.id || "");
        console.log("onEnablePIP", video?.id);
      }}
      onDisablePIP={() => {
        defaultPlayerEventBus.emit("onDisablePIP", video?.id || "");
        console.log("onDisablePIP", video?.id);
      }}
      onProgress={(state: OnProgressProps) => {
        defaultPlayerEventBus.emit("onProgress", video?.id || "", state);
        updateState({
          progress: state.playedSeconds,
          progressRecordedAt: Date.now(),
        });
      }}
      onDuration={(dur: number) => {
        defaultPlayerEventBus.emit("onDuration", video?.id || "", dur);
        updateState({ duration: dur });
      }}
      onSeek={(s: number) => {
        defaultPlayerEventBus.emit("onSeek", video?.id || "", s);
      }}
      onEnded={() => {
        defaultPlayerEventBus.emit("onEnded", video?.id || "");
        updateState({ status: "ended" });
      }}
    />
  );
};
