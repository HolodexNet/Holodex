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
        "border border-border bg-muted hover:border-border hover:bg-accent",
        "py-1.5 pr-3 pl-1.5 transition-all duration-200",
        "hover:shadow-md hover:shadow-primary/5",
        isPending && "pointer-events-none opacity-50",
      )}
    >
      <ChannelImg
        channelId={channel.id}
        className="h-7 w-7 ring-2 ring-border"
      />
      <span className="max-w-[140px] truncate text-sm font-medium">
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
                "absolute -top-1 -right-1 flex h-5 w-5 items-center justify-center",
                "rounded-full border border-border bg-card",
                "hover:text-destructive-foreground text-muted-foreground hover:border-destructive hover:bg-destructive",
                "opacity-0 transition-all duration-150 group-hover:opacity-100",
                "shadow-sm",
              )}
              disabled={isPending}
            >
              <div className="i-lucide:x h-3 w-3" />
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
    <div className="overflow-hidden rounded-xl border border-border bg-card">
      <div className="flex items-center justify-between gap-3 border-b border-border bg-muted/50 px-4 py-3">
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
                    <div className="i-lucide:loader-2 h-4 w-4 animate-spin" />
                  ) : (
                    <div className="i-lucide:save h-4 w-4" />
                  )}
                  {t("views.editor.changeTopic.button")}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="max-w-xs text-xs">
                Changes may take up to 5 minutes to reflect across the site
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
        {topicChanged && (
          <div className="mt-3 flex items-center gap-2 text-xs text-primary">
            <div className="i-lucide:info h-3.5 w-3.5" />
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
              <div className="flex animate-pulse items-center gap-2 text-sm text-muted-foreground">
                <div className="i-lucide:loader-2 h-4 w-4 animate-spin" />
                <span className="hidden sm:inline">Updating...</span>
              </div>
            )}
          </div>

          {/* Mentions Display */}
          {video.mentions && video.mentions.length > 0 ? (
            <div className="space-y-3">
              <p className="flex items-center gap-2 text-sm text-muted-foreground italic">
                <span className="i-lucide:info inline-flex size-5 shrink-0" />
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
              <div className="flex flex-wrap gap-2">
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
            <div className="flex flex-col items-center justify-center py-8 text-center text-muted-foreground">
              <div className="i-lucide:user-plus mb-2 h-8 w-8 opacity-50" />
              <p className="text-sm">No channel mentions yet</p>
              <p className="mt-1 text-xs">
                Use the picker above to add channels that appear in this video
              </p>
            </div>
          )}
        </div>
      </EditorSection>
    </div>
  );
}
