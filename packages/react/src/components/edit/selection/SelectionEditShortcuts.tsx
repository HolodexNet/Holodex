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
  const selectionContainsClips = selectedVideos.some((x) => x.type === "clip");
  const selectionContainsNoClip = selectedVideos.every(
    (x) => x.type !== "clip",
  );
  const selectionContainsNoPlaceholders = selectedVideos.every(
    (x) => x.type !== "placeholder",
  );
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
        {!selectionContainsClips && selectionContainsNoClip && (
          <DropdownMenuItem>Merge Participant Lists</DropdownMenuItem>
        )}
        {selectionContainsNoClip && selectionContainsNoPlaceholders && (
          <DropdownMenuItem>Make Simulwatch</DropdownMenuItem>
        )}
        {selectionContainsNoClip &&
          selectionContainsNoPlaceholders &&
          selectedVideos?.length < 4 && (
            <DropdownMenuItem>Make videos refer to each other</DropdownMenuItem>
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
