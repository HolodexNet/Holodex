import { usePlaylists } from "@/services/playlist.service";
import PlaylistEntry from "@/components/playlist/PlaylistEntry";
import { TypographyH3 } from "@/shadcn/ui/typography";
import { useTranslation } from "react-i18next";

export default function Playlists() {
  const { data: playlists } = usePlaylists();

  const { t } = useTranslation();

  return (
    <div className="container">
      <TypographyH3>{t("views.playlist.page-heading")}</TypographyH3>
      {playlists?.map((playlist) => {
        return <PlaylistEntry {...playlist} key={playlist.id} />;
      })}
    </div>
  );
}
