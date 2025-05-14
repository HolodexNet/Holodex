import { cn } from "@/lib/utils";
import { Link } from "react-router-dom";

export const StartPlaylistLink = ({
  children,
  firstVideoId,
  playlistId,
  className,
  ...props
}: React.HTMLAttributes<HTMLAnchorElement> & {
  children: React.ReactNode;
  firstVideoId: string | undefined;
  playlistId: number;
}) => {
  return (
    <Link
      to={`/watch/${firstVideoId}?${new URLSearchParams({ playlist: playlistId.toString() })}`}
      className={cn(
        firstVideoId === undefined && "pointer-events-none opacity-50",
        className,
      )}
      {...props}
    >
      {children}
    </Link>
  );
};

export default StartPlaylistLink;
