import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shadcn/ui/dropdown-menu";
import { ChevronUpIcon } from "@radix-ui/react-icons";
import { Button } from "@/shadcn/ui/button";
import { useVideoSelection } from "@/hooks/useVideoSelection";

import {
  useMergeParticipantsMutation,
  useSimulcastMutation,
  useReferMutation,
  useDissociateVideoMutation,
  useDissociateChannelMutation,
  useRemoveMentionsMutation,
} from "./shortcuts.service";
import { useToast } from "@/shadcn/ui/use-toast";
import { useParams } from "react-router-dom";
import { useAtomValue } from "jotai";
import { currentVideoChannelAtom } from "@/store/video";

interface SmartEditItemProps {
  selectedVideos: string[]; // video IDs
  pageVideo?: string | null;
  pageChannel?: string | null;
}

export function MergeParticipantsItem({
  selectedVideos,
  pageVideo,
  pageChannel,
}: SmartEditItemProps) {
  const { toast } = useToast();
  const mutation = useMergeParticipantsMutation({
    onSuccess: () => toast({ title: "Successfully merged participant lists" }),
    onError: () =>
      toast({ title: "Failed to merge participants", variant: "destructive" }),
  });

  return (
    <DropdownMenuItem
      onClick={() =>
        mutation.mutate({
          videoIds: selectedVideos,
          pageVideoId: pageVideo ?? undefined,
          pageChannelId: pageChannel ?? undefined,
        })
      }
    >
      <span className="i-tabler:users mr-2" />
      Merge Participant Lists
    </DropdownMenuItem>
  );
}

export function SimulcastItem({
  selectedVideos,
  pageVideo,
  pageChannel,
}: SmartEditItemProps) {
  const { toast } = useToast();
  const mutation = useSimulcastMutation({
    onSuccess: () => toast({ title: "Successfully created simulcast" }),
    onError: () =>
      toast({ title: "Failed to create simulcast", variant: "destructive" }),
  });

  return (
    <DropdownMenuItem
      onClick={() =>
        mutation.mutate({
          videoIds: selectedVideos,
          pageVideoId: pageVideo ?? undefined,
          pageChannelId: pageChannel ?? undefined,
        })
      }
    >
      <span className="i-tabler:player-play mr-2" />
      Make Simulwatch
    </DropdownMenuItem>
  );
}

export function ReferItem({
  selectedVideos,
  pageVideo,
  pageChannel,
}: SmartEditItemProps) {
  const { toast } = useToast();
  const mutation = useReferMutation({
    onSuccess: () =>
      toast({ title: "Successfully created refer relationships" }),
    onError: () =>
      toast({
        title: "Failed to create refer relationships",
        variant: "destructive",
      }),
  });

  return (
    <DropdownMenuItem
      onClick={() =>
        mutation.mutate({
          videoIds: selectedVideos,
          pageVideoId: pageVideo ?? undefined,
          pageChannelId: pageChannel ?? undefined,
        })
      }
    >
      <span className="i-tabler:link mr-2" />
      Make videos refer to each other
    </DropdownMenuItem>
  );
}

export function DissociateVideoItem({
  selectedVideos,
  pageVideo,
  pageChannel,
}: SmartEditItemProps) {
  const { toast } = useToast();
  const mutation = useDissociateVideoMutation({
    onSuccess: () => toast({ title: "Successfully dissociated videos" }),
    onError: () =>
      toast({ title: "Failed to dissociate videos", variant: "destructive" }),
  });

  if (!pageVideo) return null;

  return (
    <DropdownMenuItem
      onClick={() =>
        mutation.mutate({
          videoIds: selectedVideos,
          targetVideoId: pageVideo,
          pageVideoId: pageVideo,
          pageChannelId: pageChannel ?? undefined,
        })
      }
    >
      <span className="i-tabler:unlink mr-2" />
      Disassociate w/ Current Video
    </DropdownMenuItem>
  );
}

export function DissociateChannelItem({
  selectedVideos,
  pageVideo,
  pageChannel,
}: SmartEditItemProps) {
  const { toast } = useToast();
  const mutation = useDissociateChannelMutation({
    onSuccess: () => toast({ title: "Successfully dissociated from channel" }),
    onError: () =>
      toast({
        title: "Failed to dissociate from channel",
        variant: "destructive",
      }),
  });

  if (!pageChannel) return null;

  return (
    <DropdownMenuItem
      onClick={() =>
        mutation.mutate({
          videoIds: selectedVideos,
          channelId: pageChannel,
          pageVideoId: pageVideo ?? undefined,
          pageChannelId: pageChannel,
        })
      }
    >
      <span className="i-tabler:user-minus mr-2" />
      Disassociate w/ Current Channel
    </DropdownMenuItem>
  );
}

export function RemoveMentionsItem({
  selectedVideos,
  pageVideo,
  pageChannel,
}: SmartEditItemProps) {
  const { toast } = useToast();
  const mutation = useRemoveMentionsMutation({
    onSuccess: () => toast({ title: "Successfully removed all mentions" }),
    onError: () =>
      toast({ title: "Failed to remove mentions", variant: "destructive" }),
  });

  const handleClick = () => {
    const confirmed = window.confirm(
      "Removing mentions from clips (if any are selected) will make them hidden (and difficult to undo). Continue?",
    );
    if (!confirmed) return;

    mutation.mutate({
      videoIds: selectedVideos,
      pageVideoId: pageVideo ?? undefined,
      pageChannelId: pageChannel ?? undefined,
    });
  };

  return (
    <DropdownMenuItem onClick={handleClick}>
      <span className="i-tabler:user-off mr-2" />
      Remove all Mentions
    </DropdownMenuItem>
  );
}

export function SmartMultiEditShortcutsMenu() {
  const { selectedVideos } = useVideoSelection();

  const selectionContainsClips = selectedVideos.some((x) => x.type === "clip");
  const selectionContainsNoClip = selectedVideos.every(
    (x) => x.type !== "clip",
  );
  const selectionContainsNoPlaceholders = selectedVideos.every(
    (x) => x.type !== "placeholder",
  );
  const hasMentions = selectedVideos.some((x) => x.mentions?.length);
  // if location is a video, then the ID in path is the pageVideo.
  // if location is a channel, then the ID in path is the pageChannel.
  const { videoId, channelId } = useParams();

  const currentVideoChannelId = useAtomValue(currentVideoChannelAtom);

  const commonProps = {
    selectedVideos: selectedVideos.map((x) => x.id),
    pageVideo: videoId,
    pageChannel: channelId ?? currentVideoChannelId,
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
          <span className="i-tabler:bulb mr-2" />
          Intelligent Multi-Edit
          <ChevronUpIcon className="ml-2 size-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        {!selectionContainsClips && selectionContainsNoClip && (
          <MergeParticipantsItem {...commonProps} />
        )}
        {selectionContainsNoClip && selectionContainsNoPlaceholders && (
          <SimulcastItem {...commonProps} />
        )}
        {selectionContainsNoClip &&
          selectionContainsNoPlaceholders &&
          selectedVideos?.length < 4 && <ReferItem {...commonProps} />}
        {commonProps.pageVideo && <DissociateVideoItem {...commonProps} />}
        {commonProps.pageChannel && <DissociateChannelItem {...commonProps} />}
        {hasMentions && <RemoveMentionsItem {...commonProps} />}
        {selectedVideos.length === 0 && (
          <DropdownMenuItem disabled>
            <span className="i-tabler:info-circle mr-2" />
            No options available for selected videos.
          </DropdownMenuItem>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
