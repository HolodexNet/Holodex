import { defineStore } from "pinia";
import { io, Socket } from "socket.io-client";
import { Ref } from "vue";
import debounce from "lodash-es/debounce";
import { VideoUpdatePayload } from "@/components/tldex/client/useTldex";

interface State {
  socket: Socket;
  connected: Ref<boolean>;
  activeSockets: number;
  subscribedRooms: Set<string>;
}

const API_BASE_URL = `${window.location.origin}`;

// socket io events:

type SocketIOEvents = [
  "connect",
  "error",
  "disconnect",
  "reconnect",
  "reconnect_attempt",
  "reconnecting",
  "reconnect_error",
  "reconnect_failed",
  "connect_error",
  "connect_timeout",
  "connecting",
  "ping",
  "pong"
][number];

interface SubscribeErrorPayload {
  id: string;
  message: string;
}
interface ServerToClientEvents {
  subscribeError: (obj: SubscribeErrorPayload) => void;
  subscribeSuccess: (obj: VideoUpdatePayload) => void;
  unsubscribeSuccess: (obj: { id: string }) => void;
}

interface ClientToServerEvents {
  subscribe: (payload: { video_id: string; lang: string }) => void;
}

const IDLE_DISCONNECT_TIME = 5000;

export const useSocket = defineStore("socket-dexTL", {
  state: (): State => {
    console.log("Constructing Socket: ", API_BASE_URL + "/api/socket.io/");
    const subscribedRooms = new Set<string>();
    const socket: Socket<ServerToClientEvents, ClientToServerEvents> = io(
      API_BASE_URL,
      {
        reconnectionAttempts: 10,
        reconnectionDelay: 5000,
        reconnectionDelayMax: 20000,
        transports: ["websocket"],
        upgrade: true,
        path: "/api/socket.io/",
        secure: true,
        autoConnect: false,
      }
    );

    const connected = ref(false);

    // Debounced socket disconnect if nothing is connected
    const cleanup = debounce(() => {
      if (subscribedRooms.size == 0) {
        socket.disconnect();
        console.log("Disconnecting from socket");
      } else {
        console.log(
          "Found",
          subscribedRooms.size,
          "rooms active",
          subscribedRooms.entries()
        );
      }
    }, IDLE_DISCONNECT_TIME);

    socket.on("connect", () => (connected.value = true));
    socket.on("disconnect", () => (connected.value = false));
    // socket.on("reconnect_attempt", (attempt: number) => {});
    socket.on("subscribeSuccess", (payload) => {
      console.log("sub to", payload);
      subscribedRooms.add(payload.id);
      cleanup();
    });
    // socket.on("subscribeError", (payload) => {});
    socket.on("unsubscribeSuccess", (payload) => {
      console.log("unsub to", payload);
      subscribedRooms.delete(payload.id);
      cleanup();
    });
    return {
      subscribedRooms,
      socket,
      connected,
      activeSockets: 0,
    };
  },
  actions: {
    joinRoom(videoId: string, lang: string) {
      const roomKey = `${videoId}/${lang}`;

      // Already subscribed
      if (this.subscribedRooms.has(videoId)) {
        return;
      }
      if (!this.socket.connected) {
        console.log("Connecting to socket");
        this.socket.connect();
      }
      this.socket.emit("subscribe", {
        video_id: videoId,
        lang,
      });
    },
    leaveRoom(videoId: string, lang: string) {
      const roomKey = `${videoId}/${lang}`;
      // More than one listener active, abort
      if (this.socket.listeners(roomKey).length > 1) {
        return;
      }
      this.socket.emit("unsubscribe", {
        video_id: videoId,
        lang,
      });
    },
  },
  share: {
    enable: false,
  },
  persistedState: {
    persist: false,
  },
});
