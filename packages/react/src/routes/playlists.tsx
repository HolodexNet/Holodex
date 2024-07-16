import { usePlaylists } from "@/services/playlist.service";
import PlaylistEntry from "@/components/playlist/PlaylistEntry";
import { TypographyH3 } from "@/shadcn/ui/typography";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet-async";

export function Playlists() {
  const { data: playlists } = usePlaylists();

  const { t } = useTranslation();

  return (
    <>
      <Helmet>
        <title>{t("component.mainNav.playlist")} - Holodex</title>
      </Helmet>
      <div className="container">
        <TypographyH3>{t("views.playlist.page-heading")}</TypographyH3>
        {playlists?.map((playlist) => {
          return <PlaylistEntry {...playlist} key={playlist.id} />;
        })}
      </div>
    </>
  );
}
