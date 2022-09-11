import { Ref } from "vue";

export interface VideoPlayer {
  //   playerReady: () => void;
  //   playerError: () => void;
  getCurrentTime: () => Promise<number>;
  getPlaybackRate: () => Promise<number>;
  getVolume: () => Promise<number>;
  setVolue: () => void;
  seekTo: () => void;

  setMute: () => void;
  isMuted: () => Promise<boolean>;
  setPlaying: () => void;

  sendLikeEvent?: () => void;
}

export interface PlayerRef {
  player: VideoPlayer;

  currentTime: Ref<number>;
}
