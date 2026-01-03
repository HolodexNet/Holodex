import { useCallback, useMemo } from "react";
import { atom, useAtom, useAtomValue, useSetAtom } from "jotai";
import { useStore } from "jotai";
import {
  activeVideosAtom,
  multiviewVolumeAtom,
  multiviewMutedAtom,
  cellQueueAtom,
  visibleCellsAtom,
  createCellEntry,
} from "@/store/multiview";
import {
  videoPlayerRefAtomFamily,
  videoStatusAtomFamily,
} from "@/store/player";
import { generateContentId } from "@/lib/multiview-layout";

/**
 * Hook for controlling all multiview video players.
 * Provides reactive state and control functions.
 */
export function useMultiviewPlayback() {
  const store = useStore();
  const activeVideos = useAtomValue(activeVideosAtom);
  const [volume, setVolumeAtom] = useAtom(multiviewVolumeAtom);
  const [isMuted, setMutedAtom] = useAtom(multiviewMutedAtom);

  // Get all video IDs from active cells
  const videoIds = useMemo(
    () =>
      activeVideos
        .map((cell) => cell.videoId)
        .filter((id): id is string => Boolean(id)),
    [activeVideos],
  );

  // ─────────────────────────────────────────────────────────────────────────────
  // Reactive derived atoms - these automatically subscribe to status updates
  // ─────────────────────────────────────────────────────────────────────────────

  // Derived atom: checks if ANY video is currently playing
  const isAnyPlayingAtom = useMemo(
    () =>
      atom((get) => {
        return videoIds.some((id) => {
          const status = get(videoStatusAtomFamily(id));
          return status?.status === "playing";
        });
      }),
    [videoIds],
  );

  // Derived atom: checks if ALL videos are currently playing
  const areAllPlayingAtom = useMemo(
    () =>
      atom((get) => {
        if (videoIds.length === 0) return false;
        return videoIds.every((id) => {
          const status = get(videoStatusAtomFamily(id));
          return status?.status === "playing";
        });
      }),
    [videoIds],
  );

  // Consume derived atoms
  const isAnyPlaying = useAtomValue(isAnyPlayingAtom);
  const areAllPlaying = useAtomValue(areAllPlayingAtom);

  // ─────────────────────────────────────────────────────────────────────────────
  // Player ref access (non-reactive, for imperative control)
  // ─────────────────────────────────────────────────────────────────────────────

  const getPlayerRefs = useCallback(() => {
    return videoIds
      .map((id) => {
        const refAtom = videoPlayerRefAtomFamily(id);
        return { id, player: store.get(refAtom) };
      })
      .filter(({ player }) => player !== null);
  }, [videoIds, store]);

  // ─────────────────────────────────────────────────────────────────────────────
  // Control functions
  // ─────────────────────────────────────────────────────────────────────────────

  const playAll = useCallback(() => {
    const players = getPlayerRefs();
    for (const { player } of players) {
      if (player) {
        const internal = player.getInternalPlayer();
        if (internal?.playVideo) {
          internal.playVideo();
        } else if (internal?.play) {
          internal.play();
        }
      }
    }
  }, [getPlayerRefs]);

  const pauseAll = useCallback(() => {
    const players = getPlayerRefs();
    for (const { player } of players) {
      if (player) {
        const internal = player.getInternalPlayer();
        if (internal?.pauseVideo) {
          internal.pauseVideo();
        } else if (internal?.pause) {
          internal.pause();
        }
      }
    }
  }, [getPlayerRefs]);

  const muteAll = useCallback(() => {
    setMutedAtom(true);
    const players = getPlayerRefs();
    for (const { player } of players) {
      if (player) {
        const internal = player.getInternalPlayer();
        if (internal?.mute) {
          internal.mute();
        } else if (internal && "muted" in internal) {
          internal.muted = true;
        }
      }
    }
  }, [getPlayerRefs, setMutedAtom]);

  const unmuteAll = useCallback(() => {
    setMutedAtom(false);
    const players = getPlayerRefs();
    for (const { player } of players) {
      if (player) {
        const internal = player.getInternalPlayer();
        if (internal?.unMute) {
          internal.unMute();
        } else if (internal && "muted" in internal) {
          internal.muted = false;
        }
      }
    }
  }, [getPlayerRefs, setMutedAtom]);

  const toggleMute = useCallback(() => {
    if (isMuted) {
      unmuteAll();
    } else {
      muteAll();
    }
  }, [isMuted, muteAll, unmuteAll]);

  const setVolume = useCallback(
    (newVolume: number) => {
      const clampedVolume = Math.max(0, Math.min(100, newVolume));
      setVolumeAtom(clampedVolume);

      const players = getPlayerRefs();
      for (const { player } of players) {
        if (player) {
          const internal = player.getInternalPlayer();
          if (internal?.setVolume) {
            internal.setVolume(clampedVolume);
          } else if (internal && "volume" in internal) {
            internal.volume = clampedVolume / 100;
          }
        }
      }
    },
    [getPlayerRefs, setVolumeAtom],
  );

  const reloadAll = useCallback(() => {
    // Condense cellQueue: filter only visible cells and assign new IDs
    // This forces a remount of all video players
    const visibleCells = store.get(visibleCellsAtom);
    const newQueue = visibleCells.map((cell) =>
      createCellEntry({ ...cell, id: generateContentId() }),
    );
    store.set(cellQueueAtom, newQueue);
  }, [store]);

  const togglePlayPause = useCallback(() => {
    if (isAnyPlaying) {
      pauseAll();
    } else {
      playAll();
    }
  }, [isAnyPlaying, playAll, pauseAll]);

  return {
    volume,
    isMuted,
    videoCount: videoIds.length,
    isAnyPlaying,
    areAllPlaying,
    playAll,
    pauseAll,
    togglePlayPause,
    muteAll,
    unmuteAll,
    toggleMute,
    setVolume,
    reloadAll,
  };
}
