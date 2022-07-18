import { useLangStore } from "@/stores/lang";
import { formatDistance } from "@/utils/time";
import { useTimestamp } from "@vueuse/core";
import { useI18n } from "vue-i18n";

// export function useVideoTime(video: Video) {

//     const langStore = useLangStore();
//     const { t } = useI18n({ useScope: 'global' })
//     const tick = useTimestamp({ interval: 5000 });

//     const localized = computed(() => {
//         const tickx = tick.value + 1;
//         switch (video.status) {
//             case "upcoming":
//                 // print relative time in hours if less than 24 hours,
//                 // print full date if greater than 24 hours
//                 return formatDistance(
//                     video.start_scheduled || video.available_at,
//                     langStore.lang,
//                     t,
//                     false, // allowNegative = false
//                 ); // upcoming videos don't get to be ("5 minutes ago")
//             case "live":
//                 return t("component.videoCard.liveNow");
//             default:
//                 return formatDistance(
//                     video.available_at,
//                     langStore.lang,
//                     t,
//                 );
//         }

//     })

//     return localized
// }
