import {
  usePlaylist,
  usePlaylistDeleteMutation,
  usePlaylistSaveMutation,
} from "@/services/playlist.service";
import { VideoCard } from "@/components/video/VideoCard";
import { useTranslation } from "react-i18next";
import { TypographyH3, TypographyP } from "@/shadcn/ui/typography";
import { Button } from "@/shadcn/ui/button";
import { Separator } from "@/shadcn/ui/separator";
import { useAtomValue } from "jotai";
import { userAtom } from "@/store/auth";
import { useState } from "react";
import { useToast } from "@/shadcn/ui/use-toast";

interface Props {
  playlistId?: string;
}

export default function IndividualPlaylist({ playlistId }: Props) {
  const { data: playlist, status } = usePlaylist(parseInt(playlistId!));

  const { t } = useTranslation();

  const { toast } = useToast();

  const user = useAtomValue(userAtom);

  const deleteMutation = usePlaylistDeleteMutation();
  const saveMutation = usePlaylistSaveMutation({
    onSuccess: () => {
      setEditedPlaylist(null);
      toast({
        title: "Playlist saved.",
      });
    },
  });

  const [editedPlaylist, setEditedPlaylist] = useState<Playlist | null>(null);

  if (status === "pending") {
    return <div>Loading...</div>;
  }

  if (status === "error") {
    return <div>{t("component.apiError.title")}</div>;
  }

  const shiftVideo = (origIdx: number, shift: number) =>
    setEditedPlaylist((prevState) => {
      const newVideoArr = prevState
        ? [...prevState.videos]
        : [...playlist.videos];

      const video = newVideoArr.splice(origIdx, 1)[0];

      newVideoArr.splice(origIdx + shift, 0, video);

      return prevState
        ? {
            ...prevState,
            videos: newVideoArr,
          }
        : {
            ...playlist,
            videos: newVideoArr,
          };
    });

  const deleteVideo = (origIdx: number) =>
    setEditedPlaylist((prevState) => {
      const newVideoArr = prevState
        ? [...prevState.videos]
        : [...playlist.videos];

      newVideoArr.splice(origIdx, 1);

      return prevState
        ? {
            ...prevState,
            videos: newVideoArr,
          }
        : {
            ...playlist,
            videos: newVideoArr,
          };
    });

  const playlistToRender = editedPlaylist ? editedPlaylist : playlist;

  return (
    <div className="container">
      <div className="sticky top-0 z-10 bg-mauve-2">
        <div className="flex items-center">
          <span className="i-solar:playlist-bold text-9xl !text-base-7" />
          <div className="ml-6">
            <TypographyH3>{playlist.name}</TypographyH3>
            <TypographyP className="!mt-1">
              {playlist.videos.length} Videos
            </TypographyP>
            <div className="mt-4 flex gap-3">
              <Button size="icon" variant="secondary">
                <span className="i-heroicons:play-solid" />
              </Button>
              {user?.id === playlist.user_id ? (
                <>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() =>
                      deleteMutation.mutate({ playlistId: playlist.id })
                    }
                  >
                    <span className="i-heroicons:trash-solid" />
                  </Button>
                  <Button
                    disabled={editedPlaylist === null}
                    onClick={() =>
                      saveMutation.mutate({
                        id: editedPlaylist!.id,
                        user_id: editedPlaylist!.user_id,
                        name: editedPlaylist!.name,
                        video_ids: editedPlaylist!.videos.map((v) => v.id),
                      })
                    }
                  >
                    {/* todo: intl */}
                    <span className="i-lucide:save" /> Save Changes
                  </Button>
                  {editedPlaylist !== null ? (
                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => setEditedPlaylist(null)}
                    >
                      <span className="i-heroicons:arrow-path-solid" />
                    </Button>
                  ) : null}
                </>
              ) : null}
            </div>
          </div>
        </div>
        <Separator className="mb-7 mt-3" />
      </div>
      {playlistToRender.videos.map((video, index) => {
        return (
          <div className="flex gap-2" key={video.id}>
            <div className="flex flex-col justify-between py-2">
              <Button
                size="icon"
                variant="ghost"
                onClick={() => shiftVideo(index, -1)}
              >
                <span className="i-heroicons:chevron-up-solid" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => deleteVideo(index)}
              >
                <span className="i-heroicons:x-mark-solid" />
              </Button>
              <Button
                size="icon"
                variant="ghost"
                onClick={() => shiftVideo(index, 1)}
              >
                <span className="i-heroicons:chevron-down-solid" />
              </Button>
            </div>
            <div className="grow">
              <VideoCard
                id={video.id}
                size="sm"
                channel={video.channel}
                channel_id={video.channel.id}
                type={video.type}
                title={`${index + 1}. ${video.title}`}
                description=""
                duration={video.duration}
                topic_id={video.topic_id}
                published_at={video.published_at}
                status={video.status}
                start_scheduled={null}
                start_actual={null}
                end_actual={null}
                live_viewers={null}
                songcount={0}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
