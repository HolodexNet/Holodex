import React from "react";
import { useSyncExternalStore } from "react";
import { Timeline, TimelineOptions } from ".";
import ReactPlayer from "react-player";

type TimelineState = {
  currentTime: number;
  subtitleBlocks: ParsedScripterMessage[];
  zoom: number;
  selectedArea: { begin: number; end: number } | null;
};

class TimelineStore {
  private timeline: Timeline | null = null;
  private player: ReactPlayer;
  // private canvas: HTMLCanvasElement;
  // private bgCanvas: HTMLCanvasElement;
  private listeners = new Set<() => void>();
  private state: TimelineState = {
    currentTime: 0,
    subtitleBlocks: [],
    zoom: 1,
    selectedArea: null,
  };

  constructor(
    private canvas: HTMLCanvasElement,
    private bgCanvas: HTMLCanvasElement,
    player: ReactPlayer,
    totalDuration: number,
    options: TimelineOptions,
  ) {
    // this.canvas = canvas;
    // this.bgCanvas = bgCanvas;
    this.player = player;

    if (
      this.canvas === null ||
      this.bgCanvas === null ||
      this.player === null
    ) {
      console.log("[TimelineClaude] Canvas or player is null");
      // can't initialize timeline.
      return;
    }

    this.timeline = new Timeline(
      this.canvas,
      this.bgCanvas,
      this.state.subtitleBlocks,
      totalDuration,
      () => ({ currentTime: this.player.getCurrentTime() }),
      this.updateSubtitles,
      this.updateZoom,
      this.updateSelectedArea,
      options,
      this.setTime,
      this.setTimeAndPlay,
    );

    console.log("[TimelineClaude] Timeline initialized");
    console.log(this.timeline);
  }

  private emit = () => {
    this.listeners.forEach((listener) => listener());
  };

  private updateSubtitles = (blocks: ParsedScripterMessage[]) => {
    this.state = { ...this.state, subtitleBlocks: blocks };
    this.emit();
  };

  private updateZoom = (zoom: number) => {
    this.state = { ...this.state, zoom };
    this.emit();
  };

  private updateSelectedArea = (begin: number, end: number) => {
    this.state = { ...this.state, selectedArea: { begin, end } };
    this.emit();
  };

  private setTime = (time: number) => {
    this.state = { ...this.state, currentTime: time };
    this.player.seekTo(time, "seconds");
    this.emit();
  };

  private setTimeAndPlay = (time: number) => {
    // this.setTime(time);
    this.state = { ...this.state, currentTime: time };
    this.player.seekTo(time, "seconds");
    this.player.getInternalPlayer()?.play?.();
    this.emit();
  };

  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };

  getSnapshot = () => {
    return this.state;
  };

  setData(blocks: ParsedScripterMessage[]) {
    this.timeline?.setData(blocks);
  }

  loadWaveform(data: [number, number][]) {
    this.timeline?.loadWaveform(data);
  }

  destroy() {
    this.timeline?.destroy();
    this.timeline = null;
    this.listeners.clear();
  }
}

export const useTimeline = (
  canvas: HTMLCanvasElement,
  bgCanvas: HTMLCanvasElement,
  player: ReactPlayer,
  totalDuration: number,
  options: TimelineOptions,
) => {
  console.log("[TimelineClaude] useTimeline called", canvas, bgCanvas, player);
  const store = React.useMemo(
    () => new TimelineStore(canvas, bgCanvas, player, totalDuration, options),
    [canvas, bgCanvas, player, totalDuration, options],
  );

  React.useEffect(() => {
    return () => store.destroy();
  }, [store]);

  return {
    ...useSyncExternalStore(store.subscribe, store.getSnapshot),
    setData: store.setData,
    loadWaveform: store.loadWaveform,
  };
};
