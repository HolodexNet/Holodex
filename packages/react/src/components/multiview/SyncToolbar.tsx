// ─────────────────────────────────────────────────────────────────────────────
// SyncToolbar - Bottom toolbar for video synchronization controls
// Allows synchronized playback of archived videos based on their real-time overlap
// ─────────────────────────────────────────────────────────────────────────────

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useAtomValue, useSetAtom, useStore } from "jotai";
import { atomWithStorage } from "jotai/utils";
import { useQuery } from "@tanstack/react-query";
import dayjs from "dayjs";
import { activeVideosAtom, type Cell } from "@/store/multiview";
import {
  videoPlayerRefAtomFamily,
  videoStatusAtomFamily,
} from "@/store/player";
import { useClient } from "@/hooks/useClient";
import { formatDuration } from "@/lib/time";
import { ChannelImg } from "@/components/channel/ChannelImg";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shadcn/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shadcn/ui/dropdown-menu";
import { throttle } from "@/lib/utils";

// ============================================================================
// Types
// ============================================================================

/** Video with computed timestamps for sync */
interface SyncableVideo {
  id: string;
  channelId: string;
  channelPhoto?: string;
  startTs: number; // Unix timestamp (seconds) when stream started
  endTs: number; // Unix timestamp (seconds) when stream ended
  duration: number; // Duration in seconds
}

/** Per-video offset stored in localStorage */
type SyncOffsets = Record<string, number>;

// ============================================================================
// Atoms
// ============================================================================

/** Persistent offsets for fine-tuning sync per video */
export const syncOffsetsAtom = atomWithStorage<SyncOffsets>(
  "mv-sync-offsets",
  {},
);

// ============================================================================
// Hooks
// ============================================================================

/**
 * Fetches video metadata for multiple video IDs to get timing information.
 * Uses the /api/v2/videos/:id endpoint for each video.
 */
function useSyncVideoData(videoIds: string[]) {
  const client = useClient();

  return useQuery({
    queryKey: ["sync-videos", videoIds.sort().join(",")],
    queryFn: async () => {
      if (videoIds.length === 0) return [];

      // Fetch video data in parallel
      const results = await Promise.allSettled(
        videoIds.map((id) => client<Video>(`/api/v2/videos/${id}`)),
      );

      return results
        .filter(
          (r): r is PromiseFulfilledResult<Video> => r.status === "fulfilled",
        )
        .map((r) => r.value)
        .filter((v) => v.status === "past" && v.duration > 0); // Only past videos with duration
    },
    enabled: videoIds.length > 0,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Main sync logic hook - manages synchronized playback of overlapping videos.
 */
function useVideoSync(activeVideos: Cell[]) {
  const store = useStore();

  // Get video IDs from active cells
  const videoIds = useMemo(
    () =>
      activeVideos
        .map((cell) => cell.videoId)
        .filter(
          (id): id is string =>
            typeof id === "string" && id.length > 0 && !id.startsWith("tw:"),
        ), // Only YouTube
    [activeVideos],
  );

  // Fetch video metadata
  const { data: videos = [], isLoading } = useSyncVideoData(videoIds);

  // Compute syncable videos with timestamps
  const syncableVideos = useMemo<SyncableVideo[]>(() => {
    return videos
      .map((v) => {
        // Prefer start_actual, fall back to available_at
        const startTime = v.start_actual || v.available_at;
        const startTs = startTime ? dayjs(startTime).unix() : 0;
        const duration = v.duration;

        return {
          id: v.id,
          channelId: v.channel.id,
          channelPhoto: v.channel.photo,
          startTs,
          endTs: startTs + duration,
          duration,
        };
      })
      .filter((v) => v.startTs > 0); // Only videos with valid start times
  }, [videos]);

  // Find overlapping videos (videos that stream within 1 hour of each other)
  const overlapVideos = useMemo<SyncableVideo[]>(() => {
    if (syncableVideos.length === 0) return [];

    const sorted = [...syncableVideos].sort((a, b) => a.startTs - b.startTs);
    const overlapping: SyncableVideo[] = [];

    sorted.forEach((v) => {
      if (overlapping.length === 0) {
        overlapping.push(v);
        return;
      }

      const lastVideo = overlapping[overlapping.length - 1];
      // Video starts within 1 hour of previous video ending
      if (v.startTs - lastVideo.endTs < 60 * 60) {
        overlapping.push(v);
      } else if (overlapping.length === 1) {
        // Reset if no overlap found yet
        overlapping.splice(0, 1, v);
      }
    });

    return overlapping;
  }, [syncableVideos]);

  // Timeline bounds
  const minTs = useMemo(
    () =>
      overlapVideos.length > 0
        ? Math.min(...overlapVideos.map((v) => v.startTs))
        : 0,
    [overlapVideos],
  );

  const maxTs = useMemo(
    () =>
      overlapVideos.length > 0
        ? Math.max(...overlapVideos.map((v) => v.endTs))
        : 0,
    [overlapVideos],
  );

  // Get current playback position from a video
  const getVideoCurrentTime = useCallback(
    (videoId: string): number => {
      const status = store.get(videoStatusAtomFamily(videoId));
      // Estimate current time based on progress + elapsed since last update
      const elapsed = (Date.now() - status.progressRecordedAt) / 1000;
      const isPlaying = status.status === "playing";
      return status.progress + (isPlaying ? elapsed : 0);
    },
    [store],
  );

  // Get player ref for imperative control
  const getPlayerRef = useCallback(
    (videoId: string) => {
      return store.get(videoPlayerRefAtomFamily(videoId));
    },
    [store],
  );

  return {
    videoIds,
    syncableVideos,
    overlapVideos,
    minTs,
    maxTs,
    isLoading,
    getVideoCurrentTime,
    getPlayerRef,
  };
}

// ============================================================================
// Components
// ============================================================================

export function SyncToolbar() {
  const activeVideos = useAtomValue(activeVideosAtom);
  const offsets = useAtomValue(syncOffsetsAtom);
  const setOffsets = useSetAtom(syncOffsetsAtom);

  const {
    overlapVideos,
    minTs,
    maxTs,
    isLoading,
    getVideoCurrentTime,
    getPlayerRef,
  } = useVideoSync(activeVideos);

  // Sync state
  const [paused, setPaused] = useState(true);
  const [currentTs, setCurrentTs] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [progressByVideo, setProgressByVideo] = useState<
    Record<string, number>
  >({});
  const [showSettings, setShowSettings] = useState(false);
  const [hovering, setHovering] = useState(false);
  const [hoverTs, setHoverTs] = useState(0);

  const lastSyncTimeRef = useRef(Date.now());
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const sliderRef = useRef<HTMLInputElement>(null);
  const firstPlayRef = useRef(true);

  const hasVideosToSync = overlapVideos.length >= 1;
  const totalDuration = maxTs - minTs;

  // Playback rates available
  const availablePlaybackRates = [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2];

  // Calculate current progress as percentage
  const currentProgress = useMemo(() => {
    if (totalDuration <= 0) return 0;
    return ((currentTs - minTs) / totalDuration) * 100;
  }, [currentTs, minTs, totalDuration]);

  // Convert percentage to timestamp
  const getTimeForPercent = useCallback(
    (percent: number) => {
      return (percent / 100) * totalDuration + minTs;
    },
    [totalDuration, minTs],
  );

  // Find initial start time from current player states
  const findStartTime = useCallback(() => {
    if (!hasVideosToSync) return minTs;

    const times: number[] = [];
    let firstOverlap = minTs;

    overlapVideos.forEach((v, index) => {
      const currentTime = getVideoCurrentTime(v.id);
      const t = currentTime + v.startTs;

      if (index === 0 || Math.abs(times[index - 1] - t) < 2000) {
        times.push(t);
      }

      if (v.startTs > firstOverlap && v.endTs > firstOverlap) {
        firstOverlap = v.startTs;
      }
    });

    // Return average if times are close
    if (times.length === overlapVideos.length && times.length > 0) {
      return times.reduce((a, c) => a + c, 0) / times.length;
    }

    return firstOverlap;
  }, [hasVideosToSync, overlapVideos, minTs, getVideoCurrentTime]);

  // Seek a specific video to a time
  const seekVideo = useCallback(
    (videoId: string, time: number) => {
      const player = getPlayerRef(videoId);
      if (player) {
        player.seekTo(time, "seconds");
      }
    },
    [getPlayerRef],
  );

  // Set video playing state
  const setVideoPlaying = useCallback(
    (videoId: string, playing: boolean) => {
      const player = getPlayerRef(videoId);
      if (player) {
        const internal = player.getInternalPlayer();
        if (playing) {
          if (internal?.playVideo) {
            internal.playVideo();
          } else if (internal?.play) {
            internal.play();
          }
        } else {
          if (internal?.pauseVideo) {
            internal.pauseVideo();
          } else if (internal?.pause) {
            internal.pause();
          }
        }
      }
    },
    [getPlayerRef],
  );

  // Set video playback rate
  const setVideoPlaybackRate = useCallback(
    (videoId: string, rate: number) => {
      const player = getPlayerRef(videoId);
      if (player) {
        const internal = player.getInternalPlayer();
        internal?.setPlaybackRate?.(rate);
      }
    },
    [getPlayerRef],
  );

  // Set synchronized time across all videos
  const setTime = useCallback(
    (ts: number) => {
      setCurrentTs(ts);

      overlapVideos.forEach((v) => {
        const offset = offsets[v.id] ?? 0;
        const nextTime = ts - v.startTs + offset;
        const isBefore = nextTime < 0;
        const isAfter = nextTime / v.duration > 1;

        if (isBefore || isAfter) {
          setVideoPlaying(v.id, false);
          seekVideo(v.id, isBefore ? 0 : v.duration - 1);
          return;
        }

        if (firstPlayRef.current) {
          setPaused(false);
          firstPlayRef.current = false;
        }

        setVideoPlaying(v.id, !paused);
        seekVideo(v.id, nextTime);
      });
    },
    [overlapVideos, offsets, paused, setVideoPlaying, seekVideo],
  );

  // Sync loop - keeps videos synchronized
  const sync = useCallback(() => {
    if (!hasVideosToSync) return;

    const now = Date.now();
    const syncDeltaTime = (now - lastSyncTimeRef.current) / 1000;
    lastSyncTimeRef.current = now;

    // Initialize or update currentTs
    setCurrentTs((prev) => {
      if (prev <= 0 || prev < minTs || prev > maxTs) {
        return findStartTime();
      }
      if (!paused) {
        return Math.min(
          Math.max(prev + syncDeltaTime * playbackRate, minTs),
          maxTs,
        );
      }
      return prev;
    });

    // Sync each video
    const DELTA_THRESHOLD = 1.5 * playbackRate;
    const newProgress: Record<string, number> = {};

    overlapVideos.forEach((v) => {
      const currentTime = getVideoCurrentTime(v.id);
      const offset = offsets[v.id] ?? 0;
      const expectedTime = currentTs - v.startTs + offset;

      // Update progress bar
      const percentProgress =
        currentTs > v.endTs
          ? 100
          : Math.min(100, Math.max(0, (currentTime / v.duration) * 100));
      newProgress[v.id] = percentProgress;

      const delta = Math.abs(expectedTime - currentTime);
      const isBefore = expectedTime < 0;
      const isAfter = expectedTime / v.duration > 1;

      if (isBefore || isAfter) {
        setVideoPlaying(v.id, false);
      } else if (expectedTime > 0 && delta > DELTA_THRESHOLD) {
        setVideoPlaying(v.id, !paused);
        seekVideo(v.id, expectedTime);
        setVideoPlaybackRate(v.id, playbackRate);
      }
    });

    setProgressByVideo(newProgress);
  }, [
    hasVideosToSync,
    minTs,
    maxTs,
    paused,
    playbackRate,
    currentTs,
    overlapVideos,
    offsets,
    findStartTime,
    getVideoCurrentTime,
    setVideoPlaying,
    seekVideo,
    setVideoPlaybackRate,
  ]);

  // Start sync timer
  useEffect(() => {
    if (hasVideosToSync) {
      timerRef.current = setInterval(sync, 500);
      return () => {
        if (timerRef.current) clearInterval(timerRef.current);
      };
    }
  }, [hasVideosToSync, sync]);

  // Handle pause state change
  useEffect(() => {
    overlapVideos.forEach((v) => {
      if (paused) {
        setVideoPlaying(v.id, false);
      } else {
        setTime(currentTs);
      }
    });
  }, [paused, overlapVideos, currentTs, setVideoPlaying, setTime]);

  // Handle playback rate change
  useEffect(() => {
    overlapVideos.forEach((v) => {
      setVideoPlaybackRate(v.id, playbackRate);
    });
  }, [playbackRate, overlapVideos, setVideoPlaybackRate]);

  // Slider input handler
  const handleSliderInput = useMemo(
    () =>
      throttle((e: React.ChangeEvent<HTMLInputElement>) => {
        const ts = getTimeForPercent(parseFloat(e.target.value));
        setTime(ts);
      }, 50),
    [getTimeForPercent, setTime],
  );

  // Mouse hover handlers for tooltip
  const handleMouseMove = useMemo(
    () =>
      throttle((e: React.MouseEvent<HTMLDivElement>) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const percent = ((e.clientX - rect.left) / rect.width) * 100;
        if (percent >= 0 && percent <= 100) {
          setHoverTs(getTimeForPercent(percent));
        }
      }, 10),
    [getTimeForPercent],
  );

  // Set offset for a video
  const handleSetOffset = useCallback(
    (videoId: string, value: number) => {
      setOffsets((prev) => ({ ...prev, [videoId]: value }));
    },
    [setOffsets],
  );

  // Copy share link
  const handleShare = useCallback(() => {
    const currentPath = window.location.pathname;
    const params = new URLSearchParams();

    if (currentTs > 0) {
      params.append("t", String(Math.round(currentTs)));
    }

    const offsetArr = overlapVideos.map((v) => offsets[v.id] ?? 0);
    if (offsetArr.some((o) => o !== 0)) {
      params.append("offsets", offsetArr.join(","));
    }

    const url = `${window.origin}${currentPath}${params.toString() ? `?${params.toString()}` : ""}`;
    navigator.clipboard.writeText(url);
    // TODO: Toast notification
  }, [currentTs, overlapVideos, offsets]);

  // Format time display
  const formatTime = (ts: number) => dayjs.unix(ts).format("LTS");
  const currentDuration = formatDuration((currentTs - minTs) * 1000);
  const totalDurationStr = formatDuration(totalDuration * 1000);

  // Calculate progress bar data
  const progressBarData = useMemo(() => {
    if (totalDuration <= 0) return [];
    return overlapVideos.map((v) => ({
      id: v.id,
      channelId: v.channelId,
      channelPhoto: v.channelPhoto,
      offset: (v.startTs - minTs) / totalDuration,
      width: (v.endTs - v.startTs) / totalDuration,
    }));
  }, [overlapVideos, minTs, totalDuration]);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex h-[100px] w-full items-center justify-center border-t border-border bg-card/95 px-4 py-3 backdrop-blur-sm">
        <span className="i-tabler:loader-2 h-6 w-6 animate-spin text-muted-foreground" />
        <span className="ml-2 text-sm text-muted-foreground">
          Loading video timing data...
        </span>
      </div>
    );
  }

  return (
    <div className="sync-bar flex w-full items-center gap-2 border-t border-border bg-card/95 px-3 py-2 shadow-lg backdrop-blur-sm">
      {/* Left side - Play controls cluster */}
      <div className="flex w-[120px] shrink-0 flex-col items-center gap-1">
        {/* Duration display */}
        {hasVideosToSync && (
          <div className="text-center text-xs text-muted-foreground">
            {currentDuration} / {totalDurationStr}
          </div>
        )}

        {/* Transport controls */}
        <div className="flex items-center gap-0.5">
          <button
            onClick={() => setTime(currentTs - 10)}
            disabled={!hasVideosToSync}
            className="rounded p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:opacity-40"
            title="Rewind 10 seconds"
          >
            <span className="i-heroicons:backward-solid h-4 w-4" />
          </button>

          <button
            onClick={() => setPaused((p) => !p)}
            disabled={!hasVideosToSync}
            className="rounded p-1.5 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:opacity-40"
            title={paused ? "Play" : "Pause"}
          >
            <span
              className={`h-6 w-6 ${paused ? "i-heroicons:play-solid" : "i-heroicons:pause-solid"}`}
            />
          </button>

          <button
            onClick={() => setTime(currentTs + 10)}
            disabled={!hasVideosToSync}
            className="rounded p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground disabled:opacity-40"
            title="Forward 10 seconds"
          >
            <span className="i-heroicons:forward-solid h-4 w-4" />
          </button>
        </div>

        {/* Secondary controls */}
        <div className="flex items-center gap-0.5">
          <button
            onClick={() => setShowSettings(true)}
            className="rounded p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            title="Sync settings"
          >
            <span className="i-heroicons:cog-6-tooth h-4 w-4" />
          </button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="rounded p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
                title="Playback speed"
              >
                <span className="i-tabler:multiplier-1x h-4 w-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="center" side="top">
              {availablePlaybackRates.map((rate) => (
                <DropdownMenuItem
                  key={rate}
                  onClick={() => setPlaybackRate(rate)}
                  className={playbackRate === rate ? "bg-accent" : ""}
                >
                  {playbackRate === rate && (
                    <span className="i-heroicons:check mr-2 h-4 w-4" />
                  )}
                  {rate}x
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <button
            onClick={handleShare}
            className="rounded p-1 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            title="Copy share link"
          >
            <span className="i-heroicons:link h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Main slider and progress area */}
      <div className="relative min-w-0 flex-1 self-start">
        {/* Hover tooltip */}
        {hovering && hasVideosToSync && (
          <div
            className="pointer-events-none absolute -top-7 z-10"
            style={{
              left: `${((hoverTs - minTs) / totalDuration) * 100}%`,
              transform: "translateX(-50%)",
            }}
          >
            <div className="rounded bg-black/80 px-2 py-1 text-center text-xs whitespace-pre text-white">
              {formatTime(hoverTs)}
              {"\n"}
              {formatDuration((hoverTs - minTs) * 1000)} / {totalDurationStr}
            </div>
          </div>
        )}

        {/* Scrollable progress container */}
        <div className="sync-progress-slider max-h-[76px] overflow-x-hidden overflow-y-auto pr-2">
          {!hasVideosToSync ? (
            <div className="flex h-16 items-center justify-center text-sm text-muted-foreground">
              <span className="i-tabler:info-circle mr-2 h-4 w-4" />
              Add archived videos to enable sync
            </div>
          ) : (
            <div className="relative">
              {/* Slider container - positioned over progress bars */}
              <div
                ref={sliderRef}
                className="absolute inset-0 z-10 ml-8"
                onMouseEnter={() => setHovering(true)}
                onMouseMove={handleMouseMove}
                onMouseLeave={() => setHovering(false)}
              >
                <input
                  type="range"
                  min="0"
                  max="100"
                  step="0.01"
                  value={currentProgress}
                  onChange={handleSliderInput}
                  className="sync-slider h-full w-full cursor-pointer appearance-none bg-transparent outline-none"
                />
              </div>

              {/* Progress bars */}
              {progressBarData.map((v) => (
                <div key={v.id} className="my-1 flex items-center">
                  <ChannelImg
                    channelId={v.channelId}
                    photo={v.channelPhoto}
                    size={24}
                    className="mr-2 h-6 w-6 shrink-0"
                  />
                  <div className="flex flex-1">
                    <div
                      className="relative h-2 overflow-hidden rounded-full bg-secondary"
                      style={{
                        marginLeft: `${(v.offset * 100).toFixed(2)}%`,
                        width: `${(v.width * 100).toFixed(2)}%`,
                      }}
                    >
                      <div
                        className="absolute inset-y-0 left-0 bg-primary transition-all"
                        style={{ width: `${progressByVideo[v.id] ?? 0}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Settings dialog */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Sync Settings</DialogTitle>
          </DialogHeader>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>
              Adjust offsets to fine-tune synchronization. Positive values delay
              the video, negative values advance it.
            </p>
            {overlapVideos.map((v) => (
              <div
                key={v.id}
                className="flex items-center justify-between gap-2"
              >
                <ChannelImg
                  channelId={v.channelId}
                  photo={v.channelPhoto}
                  size={40}
                  className="h-10 w-10 shrink-0"
                />
                <div className="flex items-center gap-1">
                  <button
                    onClick={() =>
                      handleSetOffset(v.id, (offsets[v.id] ?? 0) - 0.5)
                    }
                    className="rounded border border-border bg-card px-2 py-1 text-xs hover:bg-accent"
                  >
                    -0.5
                  </button>
                  <input
                    type="number"
                    step="0.1"
                    value={offsets[v.id] ?? 0}
                    onChange={(e) =>
                      handleSetOffset(v.id, parseFloat(e.target.value) || 0)
                    }
                    className="w-20 rounded border border-border bg-background px-2 py-1 text-center text-sm"
                  />
                  <span className="text-xs text-muted-foreground">sec</span>
                  <button
                    onClick={() =>
                      handleSetOffset(v.id, (offsets[v.id] ?? 0) + 0.5)
                    }
                    className="rounded border border-border bg-card px-2 py-1 text-xs hover:bg-accent"
                  >
                    +0.5
                  </button>
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
