import {
  currentVideoAtom,
  defaultPlayerEventBus,
  miniPlayerAtom,
  playerLocationAtom,
  playerRefAtom,
} from "@/store/player";
import clsx from "clsx";
import { useAtomValue, useSetAtom } from "jotai";
import React, { Suspense } from "react";
// import ReactPlayer from "react-player";
import { useLocation } from "react-router-dom";
import { Loading } from "../common/Loading";

const LazyReactPlayer = React.lazy(() => import("react-player"));

export const DefaultPlayerContainer = React.memo(() => {
  const setPlayerRef = useSetAtom(playerRefAtom);
  const currentVideo = useAtomValue(currentVideoAtom);
  const locations = useAtomValue(playerLocationAtom);
  const page = useLocation();
  const miniPlayer = useAtomValue(miniPlayerAtom);

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
      style={locations}
    >
      <Suspense fallback={<Loading size="xl" />}>
        <LazyReactPlayer
          ref={setPlayerRef}
          // pass `key` to prevent flicker issue https://github.com/CookPete/react-player/issues/413#issuecomment-395404630
          key={currentVideo?.url}
          style={{
            aspectRatio: "16 / 9",
          }}
          width="100%"
          height="100%"
          url={currentVideo?.url}
          controls
          config={{
            youtube: {
              playerVars: {
                origin: window.origin,
                autoplay: 1,
              },
            },
          }}
          onStart={() =>
            defaultPlayerEventBus.emit("onStart", currentVideo?.id || "")
          }
          onPlay={() =>
            defaultPlayerEventBus.emit("onPlay", currentVideo?.id || "")
          }
          onPause={() =>
            defaultPlayerEventBus.emit("onPause", currentVideo?.id || "")
          }
          onBuffer={() =>
            defaultPlayerEventBus.emit("onBuffer", currentVideo?.id || "")
          }
          onBufferEnd={() =>
            defaultPlayerEventBus.emit("onBufferEnd", currentVideo?.id || "")
          }
          onClickPreview={(e) =>
            defaultPlayerEventBus.emit(
              "onClickPreview",
              currentVideo?.id || "",
              e,
            )
          }
          onError={(a, b, c, d) =>
            defaultPlayerEventBus.emit(
              "onError",
              currentVideo?.id || "",
              a,
              b,
              c,
              d,
            )
          }
          onEnablePIP={() =>
            defaultPlayerEventBus.emit("onEnablePIP", currentVideo?.id || "")
          }
          onDisablePIP={() =>
            defaultPlayerEventBus.emit("onDisablePIP", currentVideo?.id || "")
          }
          onProgress={(state) =>
            defaultPlayerEventBus.emit(
              "onProgress",
              currentVideo?.id || "",
              state,
            )
          }
          onDuration={(dur) =>
            defaultPlayerEventBus.emit(
              "onDuration",
              currentVideo?.id || "",
              dur,
            )
          }
          onSeek={(s) =>
            defaultPlayerEventBus.emit("onSeek", currentVideo?.id || "", s)
          }
          onEnded={() => {
            defaultPlayerEventBus.emit("onEnded", currentVideo?.id || "");
            // advance to the next video?
            // TODO move this behavior into the watch page.
            // const nextVideo =
            //   queue[queue.findIndex(({ id }) => currentVideo?.id === id) + 1] ??
            //   currentVideo;
            // setCurrentVideo(nextVideo);
            // if (location.pathname.startsWith("/watch"))
            //   navigate(`/watch/${nextVideo.id}`, {
            //     state: { isMinimizable: false },
            //   });
          }}
        />
      </Suspense>
    </div>
  );
});
