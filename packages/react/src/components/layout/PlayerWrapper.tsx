import {
  PlayingVideoState,
  defaultPlayerEventBus,
  videoPlayerRefAtomFamily,
  videoStatusAtomFamily,
} from "@/store/player";
import { useAtom, useSetAtom } from "jotai";
import React, { useCallback } from "react";
import type { OnProgressProps } from "react-player/base";
import ReactPlayer from "react-player";
import { LazyReactPlayer } from "./DefaultPlayerContainer";

interface IPlayerWrapper {
  /**
   * which video ID to send player updates to
   */
  id: string;
  url: string;
  customSetPlayerRef?: React.Ref<ReactPlayer>;
}

export const PlayerWrapper = React.memo(
  ({ id, url, customSetPlayerRef }: IPlayerWrapper) => {
    const playerRefAtom = videoPlayerRefAtomFamily(id);
    const [playerRef, setPlayerRef] = useAtom(playerRefAtom);

    const videoStatusAtom = videoStatusAtomFamily(id || "x");
    const playingVideoStateSetter = useSetAtom(videoStatusAtom);
    // Assuming you have a way to access `set` for updating the atom
    const updateState = useCallback(
      (update: Partial<PlayingVideoState>) => {
        playingVideoStateSetter((prev) => ({ ...prev, ...update }));
      },
      [playingVideoStateSetter],
    );

    // useEffect(() => {
    //   const intervalId = setInterval(() => {
    //     const player = playerRef;
    //     if (player) {
    //       updateState({
    //         progress: player.getCurrentTime(),
    //         progressRecordedAt: Date.now(),
    //       });
    //     }
    //   }, 1000);

    //   return () => {
    //     clearInterval(intervalId);
    //   };
    // }, [playerRef, updateState]);

    return (
      <LazyReactPlayer
        ref={customSetPlayerRef ?? setPlayerRef}
        // pass `key` to prevent flicker issue https://github.com/CookPete/react-player/issues/413#issuecomment-395404630
        key={url}
        style={{
          aspectRatio: "16 / 9", //uncommenting this may cause the aspect ratio to lock on certain pages such as script editor
        }}
        width="100%"
        // width="auto"
        height="100%"
        url={url}
        controls
        config={{
          youtube: {
            playerVars: {
              origin: window.origin,
              autoplay: 1,
            },
          },
        }}
        progressInterval={250}
        onStart={() => {
          defaultPlayerEventBus.emit("onStart", id || "");
          updateState({ status: "playing" });
        }}
        onPlay={() => {
          defaultPlayerEventBus.emit("onPlay", id || "");
          updateState({ status: "playing" });
        }}
        onPause={() => {
          defaultPlayerEventBus.emit("onPause", id || "");
          updateState({ status: "paused" });
        }}
        onBuffer={() => {
          defaultPlayerEventBus.emit("onBuffer", id || "");
          updateState({ status: "buffering" });
        }}
        onBufferEnd={() => {
          defaultPlayerEventBus.emit("onBufferEnd", id || "");
        }}
        onClickPreview={(e: unknown) => {
          defaultPlayerEventBus.emit("onClickPreview", id || "", e);
        }}
        onError={(a: unknown, b: unknown, c: unknown, d: unknown) => {
          defaultPlayerEventBus.emit("onError", id || "", a, b, c, d);
          console.error("VIDEO PLAYER ERROR", id, a, b, c, d);
          updateState({ error: { a, b, c, d } });
        }}
        onEnablePIP={() => {
          defaultPlayerEventBus.emit("onEnablePIP", id || "");
          console.log("onEnablePIP", id);
        }}
        onDisablePIP={() => {
          defaultPlayerEventBus.emit("onDisablePIP", id || "");
          console.log("onDisablePIP", id);
        }}
        onProgress={(state: OnProgressProps) => {
          defaultPlayerEventBus.emit("onProgress", id || "", state);
          updateState({
            progress: state.playedSeconds,
            progressRecordedAt: Date.now(),
          });
        }}
        onDuration={(dur: number) => {
          defaultPlayerEventBus.emit("onDuration", id || "", dur);
          updateState({ duration: dur });
        }}
        onSeek={(s: number) => {
          defaultPlayerEventBus.emit("onSeek", id || "", s);
        }}
        onEnded={() => {
          defaultPlayerEventBus.emit("onEnded", id || "");
          updateState({ status: "ended" });
        }}
      />
    );
  },
);
