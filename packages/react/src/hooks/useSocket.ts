import { io, Socket } from "socket.io-client";
import { roomToLang, roomToVideoID, toParsedMessage } from "../lib/socket";
import { useCallback, useEffect, useMemo, useState } from "react";
import { debounce } from "@/lib/utils";
import { useAtom } from "jotai";
import { roomReferenceCounterAtom, subscribedRoomsAtom } from "@/store/socket";
import { useChatDB } from "./useChatDB";

const API_BASE_URL = `${window.location.origin}`;

// socket io events:

// type SocketIOEvents = [
//   "connect",
//   "error",
//   "disconnect",
//   "reconnect",
//   "reconnect_attempt",
//   "reconnecting",
//   "reconnect_error",
//   "reconnect_failed",
//   "connect_error",
//   "connect_timeout",
//   "connecting",
//   "ping",
//   "pong",
// ][number];

interface SubscribePayload {
  video_id: string;
  lang: string;
}

interface SubscribeSuccessPayload {
  id: string; //video_id
  lang: string;
  live_viewers?: number;
  status?: VideoStatus;
  start_actual?: string;
  handled_chats?: number;
}

interface SubscribeErrorPayload {
  id: string;
  message: string;
}

interface UnsubscribePayload {
  id: string;
  lang?: string;
}

interface ServerToClientEvents {
  subscribeError: (obj: SubscribeErrorPayload) => void;
  subscribeSuccess: (obj: SubscribeSuccessPayload) => void;
  unsubscribeSuccess: (obj: UnsubscribePayload) => void;
  [key: RoomIDString]: (obj: TldexPayload) => void;
}

interface ClientToServerEvents {
  subscribe: (payload: SubscribePayload) => void;
  unsubscribe: (payload: SubscribePayload) => void;
}

const IDLE_DISCONNECT_TIME = 5000;

function log(...args: unknown[]) {
  console.log("[Socket]", ...args);
}

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
  },
);

export function useSocket(roomId: RoomIDString) {
  const chatDB = useChatDB(roomId);
  const [subscribedRooms, setSubscribedRooms] = useAtom(subscribedRoomsAtom);
  const [roomReferenceCounter, setRoomReferenceCounter] = useAtom(
    roomReferenceCounterAtom(roomId),
  );
  const [isConnected, setIsConnected] = useState(false);

  const videoId = useMemo(() => roomToVideoID(roomId), [roomId]);
  const lang = useMemo(() => roomToLang(roomId), [roomId]);

  // Debounced socket disconnect if nothing is connected
  const cleanup = debounce(() => {
    socket.disconnect();
    log("No rooms are active. Disconnecting from socket");
  }, IDLE_DISCONNECT_TIME);

  const handleMessage = useCallback(
    (payload: TldexPayload) => {
      if ("message" in payload) {
        const parsed = toParsedMessage(payload, videoId);
        chatDB.addMessage(parsed);
      }
    },
    [chatDB, videoId],
  );

  useEffect(() => {
    const onConnect = () => setIsConnected(true);
    const onDisconnect = () => setIsConnected(false);
    const onSubscribeSuccess = (payload: SubscribeSuccessPayload) => {
      log("Subscribed to", payload);
      setSubscribedRooms({
        type: "add",
        value: `${payload.id}/${payload.lang ?? ""}`,
      });
    };
    const onUnsubscribeSuccess = (payload: UnsubscribePayload) => {
      log("Unsubscribed to", payload);
      setSubscribedRooms({
        type: "del",
        value: `${payload.id}/${payload.lang ?? ""}`,
      });
      if (subscribedRooms.size) cleanup();
    };

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    // socket.on("reconnect_attempt", (attempt: number) => {});
    socket.on("subscribeSuccess", onSubscribeSuccess);
    // socket.on("subscribeError", (payload) => {});
    socket.on("unsubscribeSuccess", onUnsubscribeSuccess);

    if (subscribedRooms.has(roomId) || subscribedRooms.has(`${videoId}/`)) {
      // Already subscribed
      log("Already subscribed. Abort sending subscription request.");
      setRoomReferenceCounter(roomReferenceCounter + 1);
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
    log("Sent subscription request: ", { videoId, lang });
    socket.on(roomId, handleMessage);
    setRoomReferenceCounter(1);

    return () => {
      // If no rooms are active, unsubscribe
      setRoomReferenceCounter(roomReferenceCounter - 1);
      if (roomReferenceCounter !== 1) {
        log("There are still active listeners, aborting full unsubscribe");
      } else {
        socket.emit("unsubscribe", {
          video_id: videoId,
          lang,
        });
        socket.off(roomId);
      }

      // If any sockets are active, disconnect
      if (subscribedRooms.size === 1) {
        socket.disconnect();
        log("Disconnecting from socket");
      } else {
        log("There are still active listeners, aborting full unsubscribe");
        log(
          "Found",
          subscribedRooms.size,
          "rooms active",
          subscribedRooms.values(),
        );
      }

      // Unsubscribe event listeners
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("subscribeSuccess", onSubscribeSuccess);
      socket.off("unsubscribeSuccess", onUnsubscribeSuccess);
      socket.off(roomId, handleMessage);
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    subscribedRooms,
    socket,
    isConnected,
    activeSockets: roomReferenceCounter,
    chatDB,
  };
}
