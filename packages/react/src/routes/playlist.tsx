import { useParams } from "react-router-dom";
import IndividualPlaylist from "@/components/playlist/IndividualPlaylist";

export default function Playlist() {
  const { id } = useParams();

  return <IndividualPlaylist playlistId={id} />;
}
