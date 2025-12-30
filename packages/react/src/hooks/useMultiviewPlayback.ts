import { useCallback, useMemo } from "react";
import { atom, useAtom, useAtomValue, useSetAtom } from "jotai";
import {
  activeVideosAtom,
  multiviewVolumeAtom,
  multiviewMutedAtom,
  cellQueueAtom,
} from "@/store/multiview";
import {
  videoPlayerRefAtomFamily,
  videoStatusAtomFamily,
} from "@/store/player";
import { useStore } from "jotai";
import { generateContentId } from "@/lib/multiview-utils";

/**
 * Hook for controlling all multiview video players.
 * Provides reactive state and control functions.
 */
export function useMultiviewPlayback() {
  const store = useStore();
  const activeVideos = useAtomValue(activeVideosAtom);
  const [volume, setVolumeAtom] = useAtom(multiviewVolumeAtom);
  const [isMuted, setMutedAtom] = useAtom(multiviewMutedAtom);
  const setCellQueue = useSetAtom(cellQueueAtom);

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
  // Jotai automatically subscribes to all videoStatusAtomFamily members
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

  // Consume derived atoms - components using this hook will re-render on changes
  const isAnyPlaying = useAtomValue(isAnyPlayingAtom);
  const areAllPlaying = useAtomValue(areAllPlayingAtom);

  // ─────────────────────────────────────────────────────────────────────────────
  // Player ref access (non-reactive, for imperative control)
  // ─────────────────────────────────────────────────────────────────────────────

  // Get all player refs for active videos
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
        // ReactPlayer's internal player access
        const internal = player.getInternalPlayer();
        if (internal?.playVideo) {
          // YouTube player
          internal.playVideo();
        } else if (internal?.play) {
          // HTML5 player
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
          // YouTube player
          internal.pauseVideo();
        } else if (internal?.pause) {
          // HTML5 player
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
          // YouTube player
          internal.mute();
        } else if (internal && "muted" in internal) {
          // HTML5 player
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
          // YouTube player
          internal.unMute();
        } else if (internal && "muted" in internal) {
          // HTML5 player
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
            // YouTube player uses 0-100
            internal.setVolume(clampedVolume);
          } else if (internal && "volume" in internal) {
            // HTML5 player uses 0-1
            internal.volume = clampedVolume / 100;
          }
        }
      }
    },
    [getPlayerRefs, setVolumeAtom],
  );

  const reloadAll = useCallback(() => {
    // Condense cellQueue: filter only cells with h > 0 and assign new IDs
    // This forces a remount of all video players
    setCellQueue((prev) =>
      prev
        .filter((cell) => cell.h > 0)
        .map((cell) => ({ ...cell, id: generateContentId() })),
    );
  }, [setCellQueue]);

  // Toggle play/pause based on current reactive state
  const togglePlayPause = useCallback(() => {
    if (isAnyPlaying) {
      pauseAll();
    } else {
      playAll();
    }
  }, [isAnyPlaying, playAll, pauseAll]);

  return {
    // Reactive state (auto-updates when underlying atoms change)
    volume,
    isMuted,
    videoCount: videoIds.length,
    isAnyPlaying,
    areAllPlaying,

    // Actions
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
