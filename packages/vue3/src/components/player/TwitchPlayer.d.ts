export interface Quality {
  bitrate: number;
  codecs: string;
  group: string;
  height: number;
  framerate?: number;
  isDefault: boolean;
  name: string;
  width: number;
}

export interface PlaybackStatistics {
  videoStatistics: VideoStatistics;
}

export interface VideoStatistics {
  backendVersion: string;

  bufferSize: number;

  codecs: string;

  displayResolution: string;

  fps: number;

  hlsLatencyBroadcaster: number;

  latencyMode: string;

  playbackRate: number;

  skippedFrames: number;

  videoResolution: string;
}
/**
 * Interface that holds all the TwitchPlayer initialization options.
 */
export interface TwitchPlayerOptions {
  /**
   * Channel name, for a live stream.
   * If channel is specified along with video and/or collection, only channel is used.
   */
  channel?: string;
  /**
   * Video ID for a specified video.
   */
  video?: string;
  /**
   * Collection ID for a specified collection.
   * If both video and collection are specified, the specified collection starts playing from the specified video.
   * If the video is not in the collection, collection is ignored and the specified video is played.
   */
  collection?: string;
  /**
   * Height of the embedded window, in pixels.
   * Can be expressed as a percentage, by passing a string like 100%. Recommended minimum: 300.
   */
  height: number | string;
  /**
   * Width of the embedded window, in pixels.
   * Can be expressed as a percentage, by passing a string like 50%. Recommended minimum: 400.
   */
  width: number | string;
  /**
   * Only required if your site is embedded on any domain(s) other than the one that instantiates the Twitch embed.
   * Example parent parameter: ["streamernews.example.com", "embed.example.com"]
   */
  parent?: string[];
  /**
   * If true, the video starts playing automatically, without the user clicking play.
   * The exception is mobile devices, on which video cannot be played without user interaction. Default: true.
   */
  autoplay?: boolean;
  /**
   * Specifies whether the initial state of the video is muted. Default: false.
   */
  muted?: boolean;
  /**
   * Only valid for Video on Demand content. Time in the video where playback starts.
   * Specifies hours, minutes, and seconds. Default: 0h0m0s (the start of the video).
   */
  time?: string;
}

export class TwitchPlayer {
  constructor(divId: string, options: TwitchPlayerOptions);

  /**
   * Disables the captions for the content that is currently playing.
   */
  disableCaptions(): void;

  /**
   * Enables the captions for the content that is currently playing.
   */
  enableCaptions(): void;

  /**
   * Retrieves the playback statistics for this player.
   * The statistics contain information such as video FPS, resolution, latency and dropped frames.
   */
  getPlaybackStats(): PlaybackStatistics;

  /**
   * Pauses the player.
   */
  pause(): void;

  /**
   * Begins playing the specified video.
   */
  play(): void;

  /**
   * Seeks to the specified timestamp (in seconds) in the video and resumes playing if paused. Does not work for live streams.
   * @param timestamp The specified timestamp (in seconds).
   */
  seek(timestamp: number): void;

  /**
   * Sets the channel to be played.
   * @param channel The selected channel.
   */
  setChannel(channel: string): void;

  /**
   * Sets the channel to be played.
   * @param channelId The selected channel's identifier.
   */
  setChannelId(channelId: string): void;

  /**
   * Sets the collection to be played.
   * Optionally also specifies the video within the collection, from which to start playback.
   * If a video ID is not provided here or the specified video is not part of the collection,
   * playback starts with the first video in the collection.
   * @param collectionId The identifier for the collection.
   * @param videoId The identifier for the video.
   */
  setCollection(collectionId: string, videoId?: string): void;

  /**
   * Returns the name of the collection currently being played.
   */
  getCollection(): string | undefined;

  /**
   * Sets the quality of the video. quality should be a string value returned by getQualities.
   * @param quality The quality to be set.
   */
  setQuality(quality: string): void;

  /**
   * Sets the video to be played to be played and starts playback at timestamp (in seconds).
   * @param videoId The identifier of the video to be played.
   * @param timestamp The spot where the playback will be started (in seconds).
   */
  setVideo(videoId: string, timestamp: number): void;

  /**
   * Returns true if the player is muted; otherwise, false.
   */
  getMuted(): boolean;

  /**
   * If true, mutes the player; otherwise, unmutes it. This is independent of the volume setting.
   * @param muted If true, player will be muted. Otherwise, it will be unmuted.
   */
  setMuted(muted: boolean): void;

  /**
   * Returns the volume level, a value between 0.0 and 1.0.
   */
  getVolume(): number;

  /**
   * Sets the volume to the specified volume level, a value between 0.0 and 1.0.
   * @param volumeLevel A number between 0 and 1.
   */
  setVolume(volumeLevel: number): void;

  /**
   * Returns the channel’s name. Works only for live streams, not VODs.
   */
  getChannel(): string | undefined;

  /**
   * Returns the current video’s timestamp, in seconds. Works only for VODs, not live streams.
   */
  getCurrentTime(): number;

  /**
   * Returns the duration of the video, in seconds. Works only for VODs,not live streams.
   */
  getDuration(): number;

  /**
   * Returns true if the live stream or VOD has ended; otherwise, false.
   */
  getEnded(): boolean;

  /**
   * Returns the available video qualities. For example, chunked (pass-through of the original source).
   */
  getQualities(): Quality[];

  /**
   * Returns the current quality of video playback.
   */
  getQuality(): string;

  /**
   * Returns the video ID. Works only for VODs, not live streams.
   */
  getVideo(): string | undefined;

  /**
   * Returns true if the video is paused; otherwise, false. Buffering or seeking is considered playing.
   */
  isPaused(): boolean;

  /**
   * Returns the channel’s identifier. Works only for live streams, not VODs.
   */
  getChannelId(): string | undefined;

  /**
   * Adds an event listener for the given event.
   * @param event The event type to which the listener should react.
   * @param callback The logic that should happen when the listener fires.
   */
  addEventListener(event: string, callback: () => void): void;
}
