import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shadcn/ui/dropdown-menu";
import { ChevronUpIcon } from "@radix-ui/react-icons";
import { Button } from "@/shadcn/ui/button";
import { useVideoSelection } from "@/hooks/useVideoSelection";

export function SelectionEditShortcuts() {
  const { selectedVideos } = useVideoSelection();
  const hasClip = selectedVideos.some(
    (x) => x.type === "clip" || x.type === "placeholder",
  );
  const hasNonClip = selectedVideos.some((x) => x.type !== "clip");
  const hasMentions = selectedVideos.some((x) => x.mentions?.length);

  const context = { pageVideo: null, pageChannel: null };
  //TODO - add context dynamism based on url route.

  const dissociateVideo = () => {
    //TODO - dissociate video
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="base-outline"
          size="sm"
          disabled={selectedVideos.length === 0}
          className="flex items-center"
        >
          <span className="i-tabler:bulb" />
          Intelligent Multi-Edit
          <ChevronUpIcon className="size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {!hasClip && hasNonClip && (
          <DropdownMenuItem>Make Collab</DropdownMenuItem>
        )}
        {hasClip && hasNonClip && (
          <DropdownMenuItem>Make Simulwatch</DropdownMenuItem>
        )}
        {context.pageVideo && (
          <DropdownMenuItem onClick={dissociateVideo}>
            Disassociate w/ Current Video
          </DropdownMenuItem>
        )}
        {context.pageChannel && (
          <DropdownMenuItem>Disassociate w/ Current Channel</DropdownMenuItem>
        )}
        {hasMentions && (
          <DropdownMenuItem>Remove all Mentions</DropdownMenuItem>
        )}
        {selectedVideos.length === 0 && (
          <DropdownMenuItem disabled>
            No options available for selected videos.
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
