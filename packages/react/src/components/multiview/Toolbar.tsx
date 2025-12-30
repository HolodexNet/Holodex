import { Selector } from "./Selector";
import { editModeAtom } from "@/store/multiview";
import { useAtom } from "jotai";
import { useAutoLayout } from "@/hooks/useAutoLayout";
import { useMultiviewPlayback } from "@/hooks/useMultiviewPlayback";
import { PresetMenu } from "./PresetMenu";
import { useState } from "react";
import { Slider } from "@/shadcn/ui/slider";

// ─────────────────────────────────────────────────────────────────────────────
// PlaybackControls - Mini button group for controlling all videos
// ─────────────────────────────────────────────────────────────────────────────

interface PlaybackControlsProps {
  isExpanded: boolean;
  onToggle: () => void;
}

function PlaybackControls({ isExpanded, onToggle }: PlaybackControlsProps) {
  const {
    volume,
    isMuted,
    videoCount,
    isAnyPlaying,
    togglePlayPause,
    toggleMute,
    setVolume,
    reloadAll,
  } = useMultiviewPlayback();

  const handleVolumeChange = (value: number[]) => {
    setVolume(value[0]);
  };

  // Collapsed state - show single Control button
  if (!isExpanded) {
    return (
      <button
        onClick={onToggle}
        className="flex flex-col items-center justify-center rounded-md px-2.5 py-1 text-muted-foreground/70 transition-colors hover:bg-accent/50 hover:text-foreground"
        title="Show playback controls"
      >
        <span className="i-lucide:sliders-horizontal h-5 w-5" />
        <span className="mt-0.5 text-[9px] leading-none">Control</span>
      </button>
    );
  }

  // Expanded state - show all controls
  return (
    <div className="flex items-center gap-0.5 rounded-lg bg-accent/30 px-1 py-0.5">
      {/* Collapse button */}
      <button
        onClick={onToggle}
        className="flex items-center justify-center rounded-md p-1.5 text-muted-foreground/70 transition-colors hover:bg-accent/50 hover:text-foreground"
        title="Hide playback controls"
      >
        <span className="i-lucide:chevron-right h-4 w-4" />
      </button>

      {/* Play/Pause */}
      <button
        onClick={togglePlayPause}
        disabled={videoCount === 0}
        className="flex items-center justify-center rounded-md p-1.5 text-muted-foreground/70 transition-colors hover:bg-accent/50 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
        title={isAnyPlaying ? "Pause all" : "Play all"}
      >
        <span
          className={`h-4 w-4 ${isAnyPlaying ? "i-lucide:pause" : "i-lucide:play"}`}
        />
      </button>

      {/* Mute */}
      <button
        onClick={toggleMute}
        disabled={videoCount === 0}
        className="flex items-center justify-center rounded-md p-1.5 text-muted-foreground/70 transition-colors hover:bg-accent/50 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
        title={isMuted ? "Unmute all" : "Mute all"}
      >
        <span
          className={`h-4 w-4 ${isMuted ? "i-lucide:volume-x" : "i-lucide:volume-2"}`}
        />
      </button>

      {/* Volume slider */}
      <Slider
        min={0}
        max={100}
        value={[volume]}
        onValueChange={handleVolumeChange}
        disabled={videoCount === 0}
        className="h-1 w-16 cursor-pointer"
        title={`Volume: ${volume}%`}
      />

      {/* Reload all */}
      <button
        onClick={reloadAll}
        disabled={videoCount === 0}
        className="flex items-center justify-center rounded-md p-1.5 text-muted-foreground/70 transition-colors hover:bg-accent/50 hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
        title="Reload all videos"
      >
        <span className="i-lucide:refresh-cw h-4 w-4" />
      </button>
    </div>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Toolbar
// ─────────────────────────────────────────────────────────────────────────────

export function Toolbar() {
  const [editMode, setEditMode] = useAtom(editModeAtom);
  const { clearAll } = useAutoLayout();
  const [playbackExpanded, setPlaybackExpanded] = useState(true);

  const toggleEditMode = () => setEditMode((prev) => !prev);
  const togglePlaybackExpanded = () => setPlaybackExpanded((prev) => !prev);

  const toggleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else if (document.exitFullscreen) {
      document.exitFullscreen();
    }
  };

  return (
    <div className="flex w-full max-w-full flex-nowrap items-center justify-between gap-2 p-1">
      {/* Video selector - constrained width */}
      <div className="min-w-0 flex-1 overflow-hidden px-1">
        <Selector />
      </div>

      {/* Toolbar buttons - fixed width, icon-centric with small labels */}
      <div className="flex shrink-0 items-center gap-0.5">
        {/* Playback controls */}
        <PlaybackControls
          isExpanded={playbackExpanded}
          onToggle={togglePlaybackExpanded}
        />
        {/* Edit mode toggle */}
        <button
          onClick={toggleEditMode}
          className={`flex flex-col items-center justify-center rounded-md px-2.5 py-1 transition-colors ${
            editMode
              ? "bg-primary/20 text-primary"
              : "text-muted-foreground/70 hover:bg-accent/50 hover:text-foreground"
          }`}
        >
          <span className="i-lucide:layout-grid h-5 w-5" />
          <span className="mt-0.5 text-[9px] leading-none">Edit</span>
        </button>

        {/* Preset selector with previews */}
        <PresetMenu>
          <button className="flex flex-col items-center justify-center rounded-md px-2.5 py-1 text-muted-foreground/70 transition-colors hover:bg-accent/50 hover:text-foreground">
            <span className="i-lucide:grid-3x3 h-5 w-5" />
            <span className="mt-0.5 text-[9px] leading-none">Presets</span>
          </button>
        </PresetMenu>

        {/* Clear all */}
        <button
          onClick={clearAll}
          className="flex flex-col items-center justify-center rounded-md px-2.5 py-1 text-muted-foreground/70 transition-colors hover:bg-destructive/10 hover:text-destructive"
        >
          <span className="i-lucide:trash-2 h-5 w-5" />
          <span className="mt-0.5 text-[9px] leading-none">Clear</span>
        </button>

        {/* Fullscreen */}
        <button
          onClick={toggleFullScreen}
          className="flex flex-col items-center justify-center rounded-md px-2.5 py-1 text-muted-foreground/70 transition-colors hover:bg-accent/50 hover:text-foreground"
        >
          <span className="i-lucide:maximize h-5 w-5" />
          <span className="mt-0.5 text-[9px] leading-none">Fullscreen</span>
        </button>
      </div>
    </div>
  );
}
