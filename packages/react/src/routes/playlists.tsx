import { usePlaylists } from "@/services/playlist.service";
import PlaylistEntry from "@/components/playlist/PlaylistEntry";
import { TypographyH3 } from "@/shadcn/ui/typography";

export default function Playlists() {
  const { data: playlists } = usePlaylists();

  return (
    <div className="container">
      <TypographyH3>Your Playlists</TypographyH3>
      {playlists?.map((playlist) => {
        return <PlaylistEntry {...playlist} key={playlist.id} />;
      })}
    </div>
  );
}
