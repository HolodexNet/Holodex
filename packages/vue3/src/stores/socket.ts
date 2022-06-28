import { defineStore } from "pinia";
import { io, Socket } from "socket.io-client";
import { Ref } from "vue";

interface State {
  socket: Socket;
  connected: Ref<boolean>;
  activeSockets: number;
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
export const useSocket = defineStore("socket-dexTL", {
  state: (): State => {
    console.log("Constructing Socket: ", API_BASE_URL + "/api/socket.io/");
    const socket = io(API_BASE_URL, {
      reconnectionAttempts: 10,
      reconnectionDelay: 5000,
      reconnectionDelayMax: 20000,
      transports: ["websocket"],
      upgrade: true,
      path: "/api/socket.io/",
      secure: true,
      autoConnect: false,
    });

    const connected = ref(false);

    socket.on("connect", () => (connected.value = true));
    socket.on("disconnect", () => (connected.value = false));
    return {
      socket,
      connected,
      activeSockets: 0,
    };
  },
  actions: {},
  share: {
    enable: false,
  },
  persistedState: {
    persist: false,
  },
});
