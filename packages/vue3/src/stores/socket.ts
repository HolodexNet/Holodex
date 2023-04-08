import { defineStore } from "pinia";
import { io, Socket } from "socket.io-client";
import { Ref } from "vue";
import { debounce } from "@/utils/functions";

import {
  Message,
  VideoUpdatePayload,
} from "@/components/tldex/client/useTldex";

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

interface SubscribePayload {
  id: string;
  lang: string;
}
interface ServerToClientEvents {
  subscribeError: (obj: SubscribeErrorPayload) => void;
  subscribeSuccess: (
    obj: SubscribePayload & Partial<VideoUpdatePayload>
  ) => void;
  unsubscribeSuccess: (obj: SubscribePayload) => void;
}

interface ClientToServerEvents {
  subscribe: (payload: SubscribePayload) => void;
}

const IDLE_DISCONNECT_TIME = 5000;

function log(...args: any[]) {
  console.log("[Socket]", ...args);
}

export const useSocket = defineStore("socket-dexTL", {
  state: (): State => {
    log("Constructing Socket: ", API_BASE_URL + "/api/socket.io/");
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
        log("Disconnecting from socket");
      } else {
        log("Found", subscribedRooms.size, "rooms active", [
          ...subscribedRooms.values(),
        ]);
      }
    }, IDLE_DISCONNECT_TIME);

    socket.on("connect", () => (connected.value = true));
    socket.on("disconnect", () => (connected.value = false));
    // socket.on("reconnect_attempt", (attempt: number) => {});
    socket.on("subscribeSuccess", (payload) => {
      log("Subscribed to", payload);
      subscribedRooms.add(`${payload.id}/${payload.lang ?? ""}`);
      cleanup();
    });
    // socket.on("subscribeError", (payload) => {});
    socket.on("unsubscribeSuccess", (payload) => {
      log("Unsubscribed to", payload);
      subscribedRooms.delete(`${payload.id}/${payload.lang ?? ""}`);
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
    joinRoom(
      videoId: string,
      lang: string,
      handler: (messages: Message) => void
    ) {
      const roomKey = `${videoId}/${lang}`;

      // Already subscribed
      // TODO: remove the second case after api update goes live
      if (
        this.subscribedRooms.has(roomKey) ||
        this.subscribedRooms.has(`${videoId}/`)
      ) {
        this.socket.on(roomKey, handler);
        return;
      }
      if (!this.socket.connected) {
        log("Connecting to socket");
        this.socket.connect();
      }
      this.socket.emit("subscribe", {
        video_id: videoId,
        lang,
      });
      this.socket.on(roomKey, handler);
    },
    leaveRoom(
      videoId: string,
      lang: string,
      handler: (messages: Message) => void
    ) {
      const roomKey = `${videoId}/${lang}`;
      // More than one listener active, abort
      if (this.socket.listeners(roomKey).length > 1) {
        log("Found more than one listener active, aborting full unsubscribe");
        this.socket.off(roomKey, handler);
        return;
      }
      this.socket.emit("unsubscribe", {
        video_id: videoId,
        lang,
      });
      this.socket.off(roomKey, handler);
    },
  },
  share: {
    enable: false,
  },
  persistedState: {
    persist: false,
  },
});
