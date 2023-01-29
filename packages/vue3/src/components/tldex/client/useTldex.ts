import { useSocket } from "@/stores/socket";
import { Ref } from "vue";
import api from "@/utils/backend-api";

interface TldexOptions {
  videoId: string;
  lang: string;
  live?: boolean;
  verified?: boolean;
  moderator?: boolean;
  vtuber?: boolean;
}

export type VideoUpdatePayload = Pick<
  Video,
  "id" | "live_viewers" | "status" | "start_actual"
>;

export interface Message {
  timestamp: number | string;
  message: string;
  name: string; // name of creator
  channel_id?: string;
  // breakpoint?: boolean; // breakpoints are used to add styling separation
  receivedAt?: number;
  duration?: number;

  // TL Dex Live Message items:
  type?: string;
  is_tl?: boolean;
  is_owner?: boolean;
  is_vtuber?: boolean;
  is_moderator?: boolean;
  is_verified?: boolean;
}

export interface ParsedMessage extends Message {
  parsed: string; // parsed output after parseMessage
  key: string;
  // relativeMs?: number;
}

type TldexPayload = VideoUpdatePayload | Message;

const EACH_LOAD_LIMIT = 20;

export function useTldex(options: Ref<TldexOptions>) {
  //   const roomKey = computed(() => );
  const tlHistoryLoading = ref(false);
  const tlHistory: Ref<ParsedMessage[]> = ref([]);
  const tlHistoryCompleted = ref(false);

  watch(
    () => options.value,
    () => {
      console.log("clearing");
      tlHistoryLoading.value = false;
      tlHistory.value = [];
      tlHistoryCompleted.value = false;
    }
  );

  function loadMessages(loadAll = false) {
    tlHistoryLoading.value = true;
    const lastTimestamp = tlHistory.value?.[0]?.timestamp;
    const { videoId, lang, verified, moderator, vtuber } = unref(options);
    const query = {
      lang,
      verified,
      moderator,
      vtuber,
      limit: loadAll ? 100000 : EACH_LOAD_LIMIT,
      ...(lastTimestamp && { before: lastTimestamp }),
    };

    api
      .chatHistory(videoId, query)
      .then(({ data }: { data: Message[] }) => {
        tlHistoryCompleted.value = data.length !== EACH_LOAD_LIMIT || loadAll;
        if (tlHistory.value.length === 0)
          tlHistory.value = data.map((x) => parseMessage(x));
        else tlHistory.value.unshift(...data.map((x) => parseMessage(x)));

        // Set last message as breakpoint, used for maintaing scrolling and styling
        // if (tlHistory.value.length) tlHistory.value[0].breakpoint = true;
      })
      .catch((e) => {
        console.error(e);
      })
      .finally(() => {
        tlHistoryLoading.value = false;
      });
  }

  const socketStore = useSocket();

  function handleMessage(payload: TldexPayload) {
    if ("message" in payload) {
      tlHistory.value.unshift(parseMessage(payload));
    }
  }
  watch(
    () =>
      [options.value.videoId, options.value.lang, options.value.live] as [
        string,
        string,
        boolean
      ],
    (newVal, oldVal) => {
      const [videoId, lang, live] = newVal;
      if (oldVal) {
        console.log("calling unsub");
        const [oldVideoId, oldLang, oldLive] = oldVal;
        if (oldLive) socketStore.leaveRoom(oldVideoId, oldLang, handleMessage);
      }
      console.log("calling sub", live);
      if (live) socketStore.joinRoom(videoId, lang, handleMessage);
    },
    {
      immediate: true,
    }
  );

  onUnmounted(() => {
    const { videoId, lang, live } = unref(options);
    if (live) {
      console.log("unmounted, offing");
      socketStore.leaveRoom(videoId, lang, handleMessage);
    }
  });

  return {
    tlHistory,
    loadMessages,
    tlHistoryCompleted,
    tlHistoryLoading,
  };
}

/**
 * Parses and augments message body with parsed value and key.
 * @param msg
 * @param relativeTsAnchor
 * @returns
 */
export function parseMessage(msg: Message): ParsedMessage {
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
