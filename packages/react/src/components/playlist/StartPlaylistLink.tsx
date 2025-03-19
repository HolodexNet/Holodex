import { cn } from "@/lib/utils";
import { forwardRef } from "react";
import { Link } from "react-router-dom";

export const StartPlaylistLink = forwardRef<
  HTMLAnchorElement,
  React.HTMLAttributes<HTMLAnchorElement> & {
    children: React.ReactNode;
    firstVideoId: string | undefined;
    playlistId: number;
  }
>(({ children, firstVideoId, playlistId, className, ...props }, ref) => {
  return (
    <Link
      ref={ref}
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
});

export default StartPlaylistLink;
