// import { useSocket } from "@/stores/socket";
// import { Ref } from "vue";
// import api from "@/utils/backend-api";
// import { TLLanguageCode } from "@/utils/consts";
// import {
//   ParsedMessage,
//   TLDexMessage,
//   toParsedMessage,
// } from "@/stores/socket_types";

// interface TldexOptions {
//   videoId: string;
//   lang: TLLanguageCode;
//   live?: boolean;
//   verified?: boolean;
//   moderator?: boolean;
//   vtuber?: boolean;
// }

// const EACH_LOAD_LIMIT = 20;

// export function useTldex(options: Ref<TldexOptions>) {
//   //   const roomKey = computed(() => );
//   const tlHistoryLoading = ref(false);
//   const tlHistory: Ref<ParsedMessage[]> = ref([]);
//   const tlHistoryCompleted = ref(false);

//   watch(
//     () => options.value,
//     () => {
//       console.log("clearing");
//       tlHistoryLoading.value = false;
//       tlHistory.value = [];
//       tlHistoryCompleted.value = false;
//     }
//   );

//   function loadMessages(loadAll = false) {
//     tlHistoryLoading.value = true;
//     const lastTimestamp = tlHistory.value?.[0]?.timestamp;
//     const { videoId, lang, verified, moderator, vtuber } = unref(options);
//     const query = {
//       lang,
//       verified,
//       moderator,
//       vtuber,
//       limit: loadAll ? 100000 : EACH_LOAD_LIMIT,
//       ...(lastTimestamp && { before: lastTimestamp }),
//     };

//     api
//       .chatHistory(videoId, query)
//       .then(({ data }: { data: TLDexMessage[] }) => {
//         tlHistoryCompleted.value = data.length !== EACH_LOAD_LIMIT || loadAll;
//         if (tlHistory.value.length === 0)
//           tlHistory.value = data.map((x) => toParsedMessage(x));
//         else tlHistory.value.unshift(...data.map((x) => toParsedMessage(x)));
//       })
//       .catch((e) => {
//         console.error(e);
//       })
//       .finally(() => {
//         tlHistoryLoading.value = false;
//       });
//   }

//   const socketStore = useSocket();

//   watch(
//     () =>
//       [options.value.videoId, options.value.lang, options.value.live] as [
//         string,
//         TLLanguageCode,
//         boolean
//       ],
//     (newVal, oldVal) => {
//       const [videoId, lang, live] = newVal;
//       if (oldVal) {
//         console.log("calling unsub");
//         const [oldVideoId, oldLang, oldLive] = oldVal;
//         if (oldLive) socketStore.leaveRoom(oldVideoId, oldLang);
//       }
//       console.log("calling sub", live);
//       if (live) socketStore.joinRoom(videoId, lang);
//     },
//     {
//       immediate: true,
//     }
//   );

//   onUnmounted(() => {
//     const { videoId, lang, live } = unref(options);
//     if (live) {
//       console.log("unmounted, offing");
//       socketStore.leaveRoom(videoId, lang);
//     }
//   });

//   return {
//     tlHistory,
//     socketStore,
//     loadMessages,
//     tlHistoryCompleted,
//     tlHistoryLoading,
//   };
// }
