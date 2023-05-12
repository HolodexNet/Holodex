import { Ref } from "vue";

export interface VideoPlayer {
  //   playerReady: () => void;
  //   playerError: () => void;
  getCurrentTime: () => Promise<number>;
  getPlaybackRate: () => Promise<number>;
  getVolume: () => Promise<number>;
  setVolue: () => void;
  seekTo: (a: number) => void;

  setMute: (a: boolean) => void;
  getMuted: () => Promise<boolean>;
  setPlaying: (a: boolean) => void;

  sendLikeEvent?: () => void;
}

export interface PlayerRef {
  player: VideoPlayer;

  currentTime: Ref<number>;
}
