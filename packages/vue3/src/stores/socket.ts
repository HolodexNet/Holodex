import { defineStore } from "pinia";
import { io, Socket } from "socket.io-client";
import { Ref } from "vue";
import { debounce } from "@/utils/functions";

import { TLLanguageCode } from "@/utils/consts";
import type {
  ParsedMessage,
  TLDexMessage,
  TldexPayload,
  VideoUpdatePayload,
} from "./socket_types";

import sorted from "sorted-array-functions";

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

type RoomIDString = `${string}/${TLLanguageCode}`;

function ParsedMessageComparator(a: ParsedMessage, b: ParsedMessage) {
  if (a.timestamp > b.timestamp) return 1;
  if (a.timestamp < b.timestamp) return -1;
  return 0;
}

/**
 * O(N) Uniqueness check
 * @param sortedMessageList
 */
function checkArrayIsUnique(sortedMessageList: ParsedMessage[]) {
  for (let i = 1; i < sortedMessageList.length; i++) {
    if (sortedMessageList[i - 1].key == sortedMessageList[i].key) {
      return false;
    }
  }
  return true;
}

/**
 * An O(N) distinct function for our parsed messages.
 * @param sortedArray
 */
function distinctSortedArray(sortedArray: ParsedMessage[]) {
  if (sortedArray.length === 0) return sortedArray;
  const ret = [sortedArray[0]];
  for (let i = 1; i < sortedArray.length; i++) {
    //Start loop at 1: sortedArray[0] can never be a duplicate
    if (sortedArray[i - 1].key !== sortedArray[i].key) {
      ret.push(sortedArray[i]);
    }
  }
  return ret;
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
      channelMessages: new Map(),
      roomReferenceCounter: new Map(),
      videoState: new Map(),
    };
  },
  actions: {
    _handleMessage(room: RoomIDString, payload: TldexPayload) {
      if ("message" in payload) {
        const parsed = parseMessage(payload);
        if (this.channelMessages.has(room)) {
          sorted.add(
            this.channelMessages.get(room) as ParsedMessage[],
            parsed,
            ParsedMessageComparator
          );
          if (
            !checkArrayIsUnique(
              this.channelMessages.get(room) as ParsedMessage[]
            )
          ) {
            this.channelMessages.set(
              room,
              distinctSortedArray(
                this.channelMessages.get(room) as ParsedMessage[]
              )
            );
          }
        } else {
          // room is new, so first message creates the array.
          this.channelMessages.set(room, [parsed]);
        }
      }
    },
    joinRoom(videoId: string, lang: TLLanguageCode) {
      const roomKey: RoomIDString = `${videoId}/${lang}`;

      if (
        this.subscribedRooms.has(roomKey) ||
        this.subscribedRooms.has(`${videoId}/`)
      ) {
        // Already subscribed
        this.roomReferenceCounter.set(
          roomKey,
          (this.roomReferenceCounter.get(roomKey) || 0) + 1
        );
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
      const handler = ((a: any) => {
        this._handleMessage(roomKey, a);
      }).bind(this);
      this.socket.on(roomKey, handler);
      this.roomReferenceCounter.set(roomKey, 1);
    },
    leaveRoom(videoId: string, lang: TLLanguageCode) {
      const roomKey: RoomIDString = `${videoId}/${lang}`;
      // More than one listener active, abort
      const countRefs = this.roomReferenceCounter.get(roomKey);
      if (countRefs) {
        this.roomReferenceCounter.set(roomKey, countRefs - 1);
      }
      if (!this.roomReferenceCounter.get(roomKey)) {
        this.socket.emit("unsubscribe", {
          video_id: videoId,
          lang,
        });
        this.socket.off(roomKey);
      } else {
        log("There are still active listeners, aborting full unsubscribe");
      }
    },
  },
  share: {
    enable: false,
  },
  persistedState: {
    persist: false,
  },
});

/**
 * Parses and augments message body with parsed value and key.
 * @param msg
 * @param relativeTsAnchor
 * @returns
 */
function parseMessage(msg: TLDexMessage): ParsedMessage {
  msg.timestamp = +msg.timestamp;
  const parsed: ParsedMessage = {
    ...msg,
    // ...(relativeTsAnchor && { relativeMs: msg.timestamp - relativeTsAnchor }),
    key: msg.name + msg.timestamp + msg.message,
    parsed: "",
  };
  // Check if there's any emojis represented as URLs formatted by backend
  if (msg.message.includes("https://") && !("parsed" in msg)) {
    // match a :HUMU:https://<url>
    const regex =
      /(\S+)(https:\/\/(yt\d+\.ggpht\.com\/[a-zA-Z0-9_\-=/]+-c-k-nd|www\.youtube\.com\/[a-zA-Z0-9_\-=/]+\.svg))/gi;
    parsed.parsed = msg.message
      .replace(/<([^>]*)>/g, "($1)")
      .replace(regex, '<img src="$2" />');
  }
  return parsed;
}
