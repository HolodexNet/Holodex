import { useLangStore } from "@/stores/lang";
import { MaybeRef, get } from "@vueuse/core";

export function useChannelPreferredName(channel: MaybeRef<{english_name?: string, name: string} | undefined>) {
  const langPrefs = useLangStore();

  const preferredName = computed(() => {
    return langPrefs.preferredLocaleFn(get(channel)?.english_name, get(channel)?.name);
  });

  return { preferredName };
}
