import { useSuspensePlaylist } from "@/services/playlist.service";
import { queueAtom } from "@/store/queue";
import { useAtom } from "jotai";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams } from "react-router-dom";

export function useCurrentVideoList() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const playlistId = searchParams.get("playlist");

  const { data: playlist } =
    useSuspensePlaylist(playlistId ? parseInt(playlistId || "") : null) || {};

  const [queue, setQueue] = useAtom(queueAtom);

  const videos = useMemo(() => {
    if (playlist) {
      const params = new URLSearchParams({ playlist: playlist.id.toString() });
      return playlist.videos.map((v) => ({
        ...v,
        link: `/watch/${v.id}?${params}`,
      }));
    }
    return queue;
  }, [playlist, queue]);

  return {
    title: playlist?.name || t("component.queue.title"),
    videos,
    clearList: !playlist ? () => setQueue([]) : undefined,
  };
}
