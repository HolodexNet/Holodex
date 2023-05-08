import { defineStore } from "pinia";
import { io, Socket } from "socket.io-client";
import { Ref } from "vue";
import { debounce } from "@/utils/functions";

import { TLLanguageCode } from "@/utils/consts";
import type {
  ParsedMessage,
  TldexPayload,
  VideoUpdatePayload,
} from "./socket_types";

import { ChatDB } from "@/components/tldex/core/ChatDB";

interface State {
  socket: Socket;
  connected: Ref<boolean>;
  activeSockets: number;
  subscribedRooms: Set<string>;
  roomReferenceCounter: Map<RoomIDString, number>;
  channelMessages: Map<RoomIDString, Array<ParsedMessage>>;
  videoState: Map<string, VideoUpdatePayload>;
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
  video_id: string;
  lang: string;
}
interface ServerToClientEvents {
  subscribeError: (obj: SubscribeErrorPayload) => void;
  subscribeSuccess: (obj: {
    id: string; //video_id
    live_viewers?: number;
    status?: VIDEO_STATUSES;
    start_actual?: string;
    handled_chats?: number;
  }) => void;
  unsubscribeSuccess: (obj: SubscribePayload) => void;
  [key: RoomIDString]: (obj: TldexPayload) => void;
}

interface ClientToServerEvents {
  subscribe: (payload: SubscribePayload) => void;
  unsubscribe: (payload: SubscribePayload) => void;
}

const IDLE_DISCONNECT_TIME = 5000;

function log(...args: any[]) {
  console.log("[Socket]", ...args);
}

type RoomIDString = `${string}/${TLLanguageCode}`;

export const useSocket = defineStore(
  "socket-dexTL",
  () => {
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

    const chatDB = reactive(new ChatDB());
    const roomReferenceCounter = reactive(new Map());
    const videoState = reactive(new Map());

    const connected = ref(false);

    // Debounced socket disconnect if nothing is connected
    const cleanup = debounce(() => {
      if (subscribedRooms.size == 0) {
        socket.disconnect();
        log("Disconnecting from socket");
      } else {
        log(
          "Found",
          subscribedRooms.size,
          "rooms active",
          [...subscribedRooms.values()],
          roomReferenceCounter
        );
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

    function _handleMessage(room: RoomIDString, payload: TldexPayload) {
      if ("message" in payload) {
        const parsed = parseMessage(payload);
        chatDB.addMessage(room, parsed);
      }
    }
    function joinRoom(videoId: string, lang: TLLanguageCode) {
      const roomKey: RoomIDString = `${videoId}/${lang}`;

      if (subscribedRooms.has(roomKey) || subscribedRooms.has(`${videoId}/`)) {
        // Already subscribed
        roomReferenceCounter.set(
          roomKey,
          (roomReferenceCounter.get(roomKey) || 0) + 1
        );
        return;
      }
      if (!socket.connected) {
        log("Connecting to socket");
        socket.connect();
      }
      socket.emit("subscribe", {
        video_id: videoId,
        lang,
      });
      log("Sent subscription request: ", videoId, lang);
      const handler = (a: any) => {
        _handleMessage(roomKey, a);
      };
      socket.on(roomKey, handler);
      roomReferenceCounter.set(roomKey, 1);
    }
    function leaveRoom(videoId: string, lang: TLLanguageCode) {
      const roomKey: RoomIDString = `${videoId}/${lang}`;
      // More than one listener active, abort
      const countRefs = roomReferenceCounter.get(roomKey);
      if (countRefs) {
        roomReferenceCounter.set(roomKey, countRefs - 1);
      }
      if (!roomReferenceCounter.get(roomKey)) {
        socket.emit("unsubscribe", {
          video_id: videoId,
          lang,
        });
        socket.off(roomKey);
      } else {
        log("There are still active listeners, aborting full unsubscribe");
      }
    }

    return {
      subscribedRooms,
      socket,
      connected,
      activeSockets: 0,
      videoState: new Map(),
      chatDB,

      joinRoom,
      leaveRoom,
    };
  },
  {
    share: { enable: false },
    persistedState: { persist: false },
  }
);
