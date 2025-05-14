import { usePlaylistSaveMutation } from "@/services/playlist.service";
import { VideoCard } from "@/components/video/VideoCard";
import { TypographyH3, TypographyP } from "@/shadcn/ui/typography";
import { Button } from "@/shadcn/ui/button";
import { Separator } from "@/shadcn/ui/separator";
import { useAtomValue } from "jotai";
import { userAtom } from "@/store/auth";
import { useState } from "react";
import { useToast } from "@/shadcn/ui/use-toast";
import { Input } from "@/shadcn/ui/input";
import DeletePlaylistDialog from "@/components/playlist/DeletePlaylistDialog";
import StartPlaylistLink from "./StartPlaylistLink";

interface Props {
  playlist: Playlist;
}

export default function IndividualPlaylist({ playlist }: Props) {
  const { toast } = useToast();

  const user = useAtomValue(userAtom);

  const saveMutation = usePlaylistSaveMutation({
    onSuccess: () => {
      setEditedPlaylist(null);
      toast({
        title: "Playlist saved.",
      });
    },
  });

  const [editedPlaylist, setEditedPlaylist] = useState<Playlist | null>(null);
  const [renaming, setRenaming] = useState(false);

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

  const rename = (newName: string) =>
    setEditedPlaylist((prevState) => {
      return prevState
        ? {
            ...prevState,
            name: newName,
          }
        : {
            ...playlist,
            name: newName,
          };
    });

  const playlistToRender = editedPlaylist ? editedPlaylist : playlist;
  const userOwnsPlaylist = playlist.user_id === user?.id;

  return (
    <div className="container">
      <div className="sticky top-0 z-10 bg-mauve-2">
        <div className="flex items-center">
          <span className="hidden text-9xl md:block i-solar:playlist-broken text-base-7!" />
          <div className="ml-6">
            <div className="flex gap-3">
              {renaming ? (
                <Input
                  value={playlistToRender.name}
                  onChange={(e) => rename(e.target.value)}
                ></Input>
              ) : (
                <TypographyH3>{playlistToRender.name}</TypographyH3>
              )}
              {userOwnsPlaylist ? (
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => setRenaming((prev) => !prev)}
                >
                  <span className="i-lucide:edit-3" />
                </Button>
              ) : null}
            </div>
            <TypographyP className="mt-1!">
              {playlist.videos.length} Videos
            </TypographyP>
            <div className="flex items-center gap-3 mt-4">
              <Button size="lg" variant="primary" asChild>
                <StartPlaylistLink
                  firstVideoId={playlist.videos[0].id}
                  playlistId={playlist.id}
                >
                  <span className="i-heroicons:play-solid" /> Play
                </StartPlaylistLink>
              </Button>
              {userOwnsPlaylist ? (
                <>
                  <DeletePlaylistDialog
                    triggerElement={
                      <Button size="icon" variant="ghost">
                        <span className="i-heroicons:trash" />
                      </Button>
                    }
                    playlistId={playlist.id}
                    playlistName={playlist.name}
                  />
                  <Button
                    disabled={editedPlaylist === null}
                    variant="secondary"
                    onClick={() =>
                      saveMutation.mutate({
                        id: editedPlaylist!.id,
                        user_id: editedPlaylist!.user_id,
                        name: editedPlaylist!.name,
                        video_ids: editedPlaylist!.videos.map((v) => v.id),
                      })
                    }
                  >
                    {/* todo: intl this */}
                    <span className="i-fluent:save-20-filled" /> Save Changes
                  </Button>
                  {editedPlaylist !== null ? (
                    <Button
                      size="icon"
                      variant="ghost"
                      title="Reset"
                      onClick={() => setEditedPlaylist(null)}
                    >
                      <span className="i-fluent:arrow-reset-20-filled" />
                    </Button>
                  ) : null}
                </>
              ) : null}
            </div>
          </div>
        </div>
        <Separator className="mt-3 mb-7" />
      </div>
      {playlistToRender.videos.map((video, index) => {
        return (
          <div className="flex gap-2" key={video.id}>
            {userOwnsPlaylist ? (
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
                  <span className="i-lucide:x" />
                </Button>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => shiftVideo(index, 1)}
                >
                  <span className="i-heroicons:chevron-down-solid" />
                </Button>
              </div>
            ) : null}
            <div className="grow">
              <VideoCard
                size="sm"
                video={{
                  ...video,
                  link: `/watch/${video.id}?${new URLSearchParams({ playlist: playlist.id.toString() })}`,
                }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
