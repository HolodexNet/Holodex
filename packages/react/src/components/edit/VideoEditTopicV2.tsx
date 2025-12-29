import { TopicPicker } from "../topic/TopicPicker";
import { useState, useMemo } from "react";
import { Button } from "@/shadcn/ui/button";
import { useTranslation } from "react-i18next";
import { ChannelPicker } from "../channel/ChannelPicker";
import {
  useVideoMentionsMutation,
  useVideoTopicMutation,
} from "@/services/video.service";
import { ChannelImg } from "../channel/ChannelImg";
import { Badge } from "@/shadcn/ui/badge";
import { usePreferredName } from "@/store/settings";
import clsx from "clsx";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/shadcn/ui/tooltip";

// Small inline channel chip component for compact display
function MentionChip({
  channel,
  onRemove,
  isPending,
}: {
  channel: ChannelBase;
  onRemove: () => void;
  isPending: boolean;
}) {
  const preferredName = usePreferredName({
    name: channel.name,
    english_name: channel.english_name,
  });

  return (
    <div
      className={clsx(
        "group relative flex items-center gap-2 rounded-full",
        "bg-muted hover:bg-accent border border-border hover:border-border",
        "py-1.5 pl-1.5 pr-3 transition-all duration-200",
        "hover:shadow-md hover:shadow-primary/5",
        isPending && "opacity-50 pointer-events-none",
      )}
    >
      <ChannelImg
        channelId={channel.id}
        className="h-7 w-7 ring-2 ring-border"
      />
      <span className="text-sm font-medium max-w-[140px] truncate">
        {preferredName}
      </span>
      <TooltipProvider>
        <Tooltip delayDuration={200}>
          <TooltipTrigger asChild>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onRemove();
              }}
              className={clsx(
                "absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center",
                "rounded-full bg-card border border-border",
                "text-muted-foreground hover:text-destructive-foreground hover:bg-destructive hover:border-destructive",
                "opacity-0 group-hover:opacity-100 transition-all duration-150",
                "shadow-sm",
              )}
              disabled={isPending}
            >
              <div className="h-3 w-3 i-lucide:x" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="top" className="text-xs">
            Remove mention
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
  );
}

// Section container with consistent styling
function EditorSection({
  icon,
  title,
  children,
  action,
}: {
  icon: string;
  title: string;
  children: React.ReactNode;
  action?: React.ReactNode;
}) {
  return (
    <div className="border bg-card overflow-hidden rounded-xl border-border">
      <div className="border-border flex items-center justify-between px-4 bg-muted/50 gap-3 py-3 border-b">
        <div className="flex items-center gap-2">
          <div className={clsx("text-primary", icon)} />
          <h3 className="text-sm font-semibold">{title}</h3>
        </div>
        {action}
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

export function VideoEditTopicV2({ video }: { video: Video }) {
  const { t } = useTranslation();
  const [topic, setTopic] = useState<string | undefined | null>(
    video?.topic_id,
  );
  const [selectedMention, setSelectedMention] = useState<
    SearchAutoCompleteChannel | undefined
  >(undefined);

  const { mutate: topicMutate, isPending: topicPending } =
    useVideoTopicMutation();
  const { mutate: mentionsMutate, isPending: mentionsPending } =
    useVideoMentionsMutation(video.id);

  // Track if topic has changed
  const topicChanged = useMemo(
    () => topic !== video?.topic_id && topic !== undefined && topic !== null,
    [topic, video?.topic_id],
  );

  const handleTopicSave = () => {
    if (topic && topicChanged) {
      topicMutate({ topicId: topic, videoId: video?.id });
    }
  };

  const handleAddMention = (channel: SearchAutoCompleteChannel | undefined) => {
    if (channel?.id) {
      mentionsMutate({
        action: "add",
        channelId: channel.id,
      });
    }
    setSelectedMention(undefined);
  };

  const handleRemoveMention = (channelId: string) => {
    mentionsMutate({ action: "del", channelIds: [channelId] });
  };

  return (
    <div className="flex flex-col gap-6 py-4">
      {/* Topic Section */}
      <EditorSection
        icon="i-lucide:tag"
        title={t("views.editor.changeTopic.title")}
        action={
          video.topic_id ? (
            <Badge variant="outline" className="text-xs font-normal">
              Current: {video.topic_id}
            </Badge>
          ) : (
            <Badge
              variant="outline"
              className="text-xs font-normal text-muted-foreground"
            >
              No topic set
            </Badge>
          )
        }
      >
        <div className="flex items-center gap-3">
          <TopicPicker
            value={topic ?? undefined}
            onSelect={setTopic}
            buttonClass="flex-1 min-w-[200px]"
          />
          <TooltipProvider>
            <Tooltip delayDuration={300}>
              <TooltipTrigger asChild>
                <Button
                  variant={topicChanged ? "primary" : "secondary"}
                  disabled={topicPending || !topicChanged}
                  onClick={handleTopicSave}
                  className="gap-2 transition-all duration-200"
                >
                  {topicPending ? (
                    <div className="animate-spin h-4 w-4 i-lucide:loader-2" />
                  ) : (
                    <div className="h-4 w-4 i-lucide:save" />
                  )}
                  {t("views.editor.changeTopic.button")}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="text-xs max-w-xs">
                Changes may take up to 5 minutes to reflect across the site
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        {topicChanged && (
          <div className="flex items-center gap-2 text-xs mt-3 text-primary">
            <div className="h-3.5 w-3.5 i-lucide:info" />
            <span>
              Topic will change from{" "}
              <span className="font-medium">{video.topic_id || "none"}</span> to{" "}
              <span className="font-medium">{topic}</span>
            </span>
          </div>
        )}
      </EditorSection>

      {/* Channel Mentions Section */}
      <EditorSection
        icon="i-lucide:at-sign"
        title={t("views.editor.channelMentions.title")}
        action={
          video.mentions && video.mentions.length > 0 ? (
            <Badge variant="outline" className="text-xs font-normal">
              {video.mentions.length}{" "}
              {video.mentions.length === 1 ? "channel" : "channels"}
            </Badge>
          ) : null
        }
      >
        <div className="space-y-4">
          {/* Add Channel Input */}
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <ChannelPicker
                value={selectedMention?.name}
                onSelect={handleAddMention}
              />
            </div>
            {mentionsPending && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground animate-pulse">
                <div className="i-lucide:loader-2 animate-spin h-4 w-4" />
                <span className="hidden sm:inline">Updating...</span>
              </div>
            )}
          </div>

          {/* Mentions Display */}
          {video.mentions && video.mentions.length > 0 ? (
            <div className="space-y-3">
              <p className="flex items-center gap-2 text-sm text-muted-foreground italic">
                <span className="i-lucide:info inline-flex shrink-0 size-5" />
                <span>
                  Mentioned channels is used to keep track of channels who are
                  actively in collab with the channel host, or showed up for a
                  good span of time. The usage can change depending on the theme
                  of the video, but generally consider mentioned channels as
                  active, present, participants that non-trivially contributed
                  to a good % of the content. Tournaments are special cases
                  where only teammates are mentioned.
                </span>
              </p>
              <div className="flex gap-2 flex-wrap">
                {video.mentions.map((channel) => (
                  <MentionChip
                    key={channel.id}
                    channel={channel}
                    onRemove={() => handleRemoveMention(channel.id)}
                    isPending={mentionsPending}
                  />
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center text-muted-foreground justify-center text-center py-8">
              <div className="opacity-50 h-8 w-8 mb-2 i-lucide:user-plus" />
              <p className="text-sm">No channel mentions yet</p>
              <p className="text-xs mt-1">
                Use the picker above to add channels that appear in this video
              </p>
            </div>
          )}
        </div>
      </EditorSection>
    </div>
  );
}
