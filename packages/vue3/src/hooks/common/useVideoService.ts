import type { MaybeRef } from "@vueuse/core";
import { get } from "@vueuse/core";

import { useLangStore } from "@/stores/lang";
import { decodeHTMLEntities } from "@/utils/functions";

export function useVideoFormat(video: MaybeRef<Video | undefined>) {
  const langStore = useLangStore();

  const preferredChannelName = computed(() => {
    return langStore.preferredLocaleFn(
      get(video)?.channel.english_name,
      get(video)?.channel.name
    );
  });

  const preferredTitle = computed(() => {
    return decodeHTMLEntities(
      langStore.preferredLocaleFn(get(video)?.title, get(video)?.jp_name)
    );
  });

  return { preferredTitle, preferredChannelName, langStore };
}
