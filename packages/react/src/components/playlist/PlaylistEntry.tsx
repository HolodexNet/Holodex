import { makeYtThumbnailUrl } from "@/lib/utils";
import { TypographyLarge, TypographyP } from "@/shadcn/ui/typography";
import { useAtomValue } from "jotai";
import { localeAtom } from "@/store/i18n";
import { useTranslation } from "react-i18next";
import { buttonVariants } from "@/shadcn/ui/button.variants";
import { Link } from "react-router-dom";
import { Button } from "@/shadcn/ui/button";
import { usePlaylistDeleteMutation } from "@/services/playlist.service";
import { userAtom } from "@/store/auth";

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

  const deleteMutation = usePlaylistDeleteMutation();

  return (
    <div className="mt-5 flex gap-5">
      <img className="h-28" src={makeYtThumbnailUrl(video_ids[0], "sm")} />
      <div>
        <TypographyLarge>{name}</TypographyLarge>
        <TypographyP className="!mt-0">
          {t("views.playlist.item-last-updated") +
            " " +
            dayjs(updated_at).format("LLL")}
        </TypographyP>
        <div className="mt-5 flex gap-3">
          <Button size="icon" variant="secondary">
            <span className="i-heroicons:play-solid" />
          </Button>
          <Link
            to={`/playlist/${id}`}
            className={buttonVariants({ size: "icon", variant: "ghost" })}
          >
            <span className="i-heroicons:pencil-square-solid" />
          </Link>
          {user?.id === user_id ? (
            <Button
              size="icon"
              variant="ghost"
              onClick={() => deleteMutation.mutate({ playlistId: id })}
            >
              <span className="i-heroicons:trash-solid" />
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
