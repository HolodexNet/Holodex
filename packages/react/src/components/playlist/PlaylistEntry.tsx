import { Link } from "react-router-dom";
import { useAtomValue } from "jotai";
import { useTranslation } from "react-i18next";
import { makeThumbnailUrl } from "@/lib/utils";
import { localeAtom } from "@/store/i18n";
import { userAtom } from "@/store/auth";
import { Button } from "@/shadcn/ui/button";
import { VideoThumbnail } from "../video/VideoThumbnail";
import DeletePlaylistDialog from "@/components/playlist/DeletePlaylistDialog";
import StartPlaylistLink from "./StartPlaylistLink";

export default function PlaylistEntry({
  video_ids,
  name,
  updated_at,
  id,
  user_id,
}: PlaylistStub) {
  const { dayjs } = useAtomValue(localeAtom);
  const { t } = useTranslation();
  const user = useAtomValue(userAtom);

  return (
    <div className="flex items-center gap-4 rounded-lg bg-base-2 p-4 shadow-sm max-md:flex-col">
      <div className="aspect-video shrink-0 max-md:w-full md:h-24">
        {video_ids && video_ids.length > 0 ? (
          <VideoThumbnail
            className="h-full rounded-md object-cover"
            src={makeThumbnailUrl(video_ids[0], "sm")}
          />
        ) : (
          <div className="grid h-full place-content-center rounded-md bg-base-5 p-4">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="4em"
              height="4em"
              viewBox="0 0 36 36"
            >
              <path
                fill="currentColor"
                d="m34.59 23l-4.08-5l4-4.9a1.82 1.82 0 0 0 .23-1.94a1.93 1.93 0 0 0-1.8-1.16h-31A1.91 1.91 0 0 0 0 11.88v12.25A1.91 1.91 0 0 0 1.94 26h31.11a1.93 1.93 0 0 0 1.77-1.09a1.82 1.82 0 0 0-.23-1.91M2 24V12h30.78l-4.84 5.93L32.85 24Z"
                className="clr-i-outline clr-i-outline-path-1"
              ></path>
              <path
                fill="currentColor"
                d="M9.39 19.35L6.13 15H5v6.18h1.13v-4.34l3.26 4.34h1.12V15H9.39z"
                className="clr-i-outline clr-i-outline-path-2"
              ></path>
              <path
                fill="currentColor"
                d="M12.18 21.18h4.66v-1.02h-3.53v-1.61h3.19v-1.03h-3.19v-1.49h3.53V15h-4.66z"
                className="clr-i-outline clr-i-outline-path-3"
              ></path>
              <path
                fill="currentColor"
                d="M24.52 19.43L23.06 15h-1.22l-1.47 4.43L19.05 15h-1.23l1.96 6.18h1.11l1.56-4.59L24 21.18h1.13L27.08 15h-1.23z"
                className="clr-i-outline clr-i-outline-path-4"
              ></path>
              <path fill="none" d="M0 0h36v36H0z"></path>
            </svg>
          </div>
        )}
      </div>
      <div className="w-full grow">
        <h3 className="mb-1 text-lg font-semibold">{name}</h3>
        <span className="text-sm text-base-10">
          {video_ids?.length || 0} {t("views.channel.video")}
        </span>
        <span className="ml-4 text-sm text-base-10">
          {t("views.playlist.item-last-updated") +
            " " +
            dayjs(updated_at).format("LLL")}
        </span>
        <div className="mt-2 flex gap-2 max-md:justify-between">
          <Button
            size="sm"
            variant="primary"
            className="w-full md:w-20"
            asChild
          >
            <StartPlaylistLink firstVideoId={video_ids[0]} playlistId={id}>
              <span className="i-heroicons:play-solid" />
            </StartPlaylistLink>
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="w-full md:w-20"
            asChild
          >
            <Link to={`/playlist/${id}`}>
              <span className="i-heroicons:pencil-square-solid mr-1" />
              {t("component.videoCard.edit")}
            </Link>
          </Button>
          {user?.id === user_id && (
            <DeletePlaylistDialog
              triggerElement={
                <Button size="sm" variant="ghost">
                  <span className="i-heroicons:trash mr-1" />
                </Button>
              }
              playlistId={id}
              playlistName={name}
            />
          )}
        </div>
      </div>
    </div>
  );
}
