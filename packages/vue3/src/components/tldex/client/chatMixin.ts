// Loads store settings, exposes loadHistory and parseMessage function
import { useTLStore } from "@/stores/tldex";
import api from "@/utils/backend-api";
import { dayjs } from "@/utils/time";
import { Ref } from "vue";
import { useQuery } from "vue-query";

export const MESSAGE_TYPES = Object.freeze({
  END: "end",
  ERROR: "error",
  INFO: "info",
  MESSAGE: "message",
  UPDATE: "update",
});

export interface Message {
  timestamp: number | string;
  relativeMs?: number;
  key?: string;
  message: string;
  parsed?: string; // parsed output after parseMessage
  name: string; // name of creator
  breakpoint?: boolean; // breakpoints are used to add styling separation
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

/**
 * Parses and augments message body with parsed value and key.
 * @param msg
 * @param relativeTsAnchor
 * @returns
 */
export function parseMessage(msg: Message, relativeTsAnchor?: number) {
  msg.timestamp = +msg.timestamp;
  if (relativeTsAnchor) {
    msg.relativeMs = msg.timestamp - relativeTsAnchor;
  }
  msg.key = msg.name + msg.timestamp + msg.message;
  // Check if there's any emojis represented as URLs formatted by backend
  if (msg.message.includes("https://") && !msg.parsed) {
    // match a :HUMU:https://<url>
    const regex =
      /(\S+)(https:\/\/(yt\d+\.ggpht\.com\/[a-zA-Z0-9_\-=/]+-c-k-nd|www\.youtube\.com\/[a-zA-Z0-9_\-=/]+\.svg))/gi;
    msg.parsed = msg.message
      .replace(/<([^>]*)>/g, "($1)")
      .replace(regex, '<img src="$2" />');
  }
  return msg;
}

/*
Components of chatMixin that were not migrated:
Props: currentTime (isn't migrated coz mixin doesn't require 'time')
State:
 - expanded //doesn't care about it
 - historyLoading // isn't relevant anymore with vue-query
 - completed // hmmmm 
 - limit // doesn't matter.
 - 
 Computed:
 - start time millis (needs reworking)
 - 
*/

const EACH_LOAD_LIMIT = 20;
/**
 * ChatMixin is a relatively complex subcomponent to help keep track of TL
 * @param videoId The video
 * @param useLocalSubtitleToggle whether to use local subtitle when toggling OR change global subtitle
 */
export function useChatMixin(
  videoId: Ref<string>,
  lang: Ref<string>,
  useLocalSubtitleToggle: Ref<boolean>,
  showSubtitleInit: Ref<boolean> | undefined | boolean
) {
  const tldex = useTLStore();
  const showSubtitleRef = ref(unref(showSubtitleInit) ?? true);

  const showSubtitle = computed({
    get: () => {
      if (useLocalSubtitleToggle) return showSubtitleRef;
      else return tldex.liveTlShowSubtitle;
    },
    set: (v) => {
      if (useLocalSubtitleToggle) showSubtitleRef.value = unref(v);
      else tldex.liveTlShowSubtitle = unref(v);
    },
  });

  const tlHistoryLoading = ref(false);
  const tlHistory: Ref<Message[]> = ref([]);
  const tlHistoryCompleted = ref(false);

  watch([videoId, lang], () => {
    tlHistoryLoading.value = false;
    tlHistory.value = [];
    tlHistoryCompleted.value = false;
  });

  function loadMessages(loadAll = false, tlClient = false) {
    tlHistoryLoading.value = true;
    const lastTimestamp = tlHistory.value?.[0]?.timestamp;

    let query = {};
    if (tlClient) {
      query = {
        lang: unref(lang),
        verified: false,
        moderator: false,
        vtuber: false,
        limit: loadAll ? 100000 : EACH_LOAD_LIMIT,
        ...(lastTimestamp && { before: lastTimestamp }),
      };
    } else {
      query = {
        lang: unref(lang),
        verified: tldex.liveTlShowVerified,
        moderator: tldex.liveTlShowModerator,
        vtuber: tldex.liveTlShowVtuber,
        limit: loadAll ? 100000 : EACH_LOAD_LIMIT,
        ...(lastTimestamp && { before: lastTimestamp }),
      };
    }

    api
      .chatHistory(unref(videoId), query)
      .then(({ data }) => {
        tlHistoryCompleted.value = data.length !== EACH_LOAD_LIMIT || loadAll;
        if (tlHistory.value.length === 0)
          tlHistory.value = data.map(parseMessage);
        else tlHistory.value.unshift(...data.map(parseMessage));

        // Set last message as breakpoint, used for maintaing scrolling and styling
        if (tlHistory.value.length) tlHistory.value[0].breakpoint = true;
      })
      .catch((e) => {
        console.error(e);
      })
      .finally(() => {
        tlHistoryLoading.value = false;
      });
  }

  return {
    showSubtitle,
    tlHistoryLoading,
    tlHistoryCompleted,
    tlHistory,
    loadMessages,
    tldex,
  };
}
