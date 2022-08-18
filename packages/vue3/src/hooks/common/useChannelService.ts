import { useLangStore } from "@/stores/lang";

export function useChannelPreferredName(channel: FullChannel) {
  const langPrefs = useLangStore();

  const preferredName = computed(() => {
    return langPrefs.preferredLocaleFn(channel.english_name, channel.name);
  });

  return { preferredName };
}
