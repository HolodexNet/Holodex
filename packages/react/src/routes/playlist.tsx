import { useParams } from "react-router-dom";
import IndividualPlaylist from "@/components/playlist/IndividualPlaylist";
import { usePlaylist } from "@/services/playlist.service";
import { useTranslation } from "react-i18next";
import { Helmet } from "react-helmet-async";

export default function Playlist() {
  const { t } = useTranslation();
  const { playlistId } = useParams();
  const { data, status } = usePlaylist(Number(playlistId));

  if (status === "pending") {
    return <div>Loading...</div>;
  }

  if (status === "error") {
    return <div>{t("component.apiError.title")}</div>;
  }

  return (
    <>
      <Helmet>
        <title>{data.name} - Holodex</title>
      </Helmet>
      <IndividualPlaylist playlist={data} />
    </>
  );
}
