import { useLangStore } from "@/stores/lang";

export function useVideo(video: Video) {
  const langPrefs = useLangStore();

  const preferredChannelName = computed(() => {
    return langPrefs.preferredLocaleFn(
      video.channel.english_name,
      video.channel.name
    );
  });

  const preferredTitle = computed(() => {
    return langPrefs.preferredLocaleFn(video.title, video.jp_name);
  });

  return { preferredTitle, preferredChannelName };
}
