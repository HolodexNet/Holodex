import {
  usePlaylistInclude,
  usePlaylistVideoMutation,
} from "@/services/playlist.service";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/shadcn/ui/dropdown-menu";
import { ReactNode, useState } from "react";
import { Link } from "react-router-dom";

interface VideoMenuProps extends Pick<VideoBase, "id" | "type" | "status"> {
  children: ReactNode;
}

export function VideoMenu({
  children,
  id: videoId,
  type,
  status,
}: VideoMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { data } = usePlaylistInclude(videoId, { enabled: isOpen });
  const { mutate } = usePlaylistVideoMutation();

  return (
    <DropdownMenu onOpenChange={setIsOpen}>
      <DropdownMenuTrigger>{children}</DropdownMenuTrigger>
      <DropdownMenuContent onClick={(e) => e.stopPropagation()}>
        <DropdownMenuItem asChild>
          <Link to={`https://youtu.be/${videoId}`} target="_blank">
            Open on YouTube
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link to={`/watch/${videoId}/edit`}>Edit</Link>
        </DropdownMenuItem>
        {type !== "clip" && (
          <DropdownMenuItem asChild>
            <Link to={`/multiview/AAUY${videoId}%2cUAEYchat`}>MultiView</Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuGroup>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger>Playlist</DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent>
                {data?.map(({ name, id }) => (
                  <DropdownMenuItem onClick={() => mutate({ id, videoId })}>
                    {name}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
        </DropdownMenuGroup>
        <DropdownMenuItem>Copy Holodex link</DropdownMenuItem>
        {status === "upcoming" && (
          <DropdownMenuItem>Add to Google calendar</DropdownMenuItem>
        )}
        <DropdownMenuItem>Open TL client</DropdownMenuItem>
        {status === "past" && (
          <DropdownMenuItem>Upload TL Script</DropdownMenuItem>
        )}
        <DropdownMenuItem>Report</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
