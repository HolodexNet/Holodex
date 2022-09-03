import { ref } from "vue";
import { createGlobalState } from "@vueuse/core";

export const useGlobalReportState = createGlobalState(() => {
  const reportedVideo = ref<VideoRef | undefined>(undefined);
  return { reportedVideo };
});
