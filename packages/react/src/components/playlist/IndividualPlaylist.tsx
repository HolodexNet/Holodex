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
          <span className="i-solar:playlist-bold hidden text-9xl !text-base-7 md:block" />
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
                  <span className="i-heroicons:pencil-solid" />
                </Button>
              ) : null}
            </div>
            <TypographyP className="!mt-1">
              {playlist.videos.length} Videos
            </TypographyP>
            <div className="mt-4 flex gap-3">
              <Button size="icon" variant="secondary">
                <span className="i-heroicons:play-solid" />
              </Button>
              {userOwnsPlaylist ? (
                <>
                  <DeletePlaylistDialog
                    triggerElement={
                      <Button size="icon" variant="ghost">
                        <span className="i-heroicons:trash-solid" />
                      </Button>
                    }
                    playlistId={playlist.id}
                    playlistName={playlist.name}
                  />
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
                    {/* todo: intl this */}
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
            ) : null}
            <div className="grow">
              <VideoCard size="sm" video={video} />
            </div>
          </div>
        );
      })}
    </div>
  );
}
