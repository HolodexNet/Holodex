import { TopicPicker } from "../topic/TopicPicker";
import { useState } from "react";
import { Button } from "@/shadcn/ui/button";
import { useTranslation } from "react-i18next";
import { TypographyH4, TypographyLarge } from "@/shadcn/ui/typography";
import { ChannelPicker } from "../channel/ChannelPicker";
import {
  useVideoMentionsMutation,
  useVideoTopicMutation,
} from "@/services/video.service";
import { ChannelCard } from "../channel/ChannelCard";
import { Loader2 } from "lucide-react";
import { Badge } from "@/shadcn/ui/badge";
import clsx from "clsx";

export function VideoEditTopic({ video }: { video: Video }) {
  const { t } = useTranslation();
  const [topic, setTopic] = useState<string | undefined | null>(
    video?.topic_id,
  );
  const [mention, setMention] = useState<SearchAutoCompleteChannel | undefined>(
    undefined,
  );
  const { mutate: topicMutate, isPending: topicPending } =
    useVideoTopicMutation();
  const { mutate: mentionsMutate, isPending: mentionsPending } =
    useVideoMentionsMutation(video.id);

  return (
    <div className="flex flex-col gap-4 p-4">
      <TypographyLarge>
        {t("views.editor.changeTopic.title")}
        <Badge
          size="lg"
          variant="outline"
          className={clsx({ "ml-2": true, "opacity-60": !video.topic_id })}
        >
          <div className="i-ion:pound mr-2 text-xs"></div>
          {video.topic_id || "?"}
        </Badge>
      </TypographyLarge>
      <TopicPicker value={topic ?? undefined} onSelect={setTopic} />
      <Button
        disabled={topicPending || !topic}
        onClick={() =>
          topic && topicMutate({ topicId: topic, videoId: video?.id })
        }
      >
        {topicPending && <Loader2 size={12} className="animate-spin" />}
        {t("views.editor.changeTopic.button")}
      </Button>
      <TypographyLarge>
        {t("views.editor.channelMentions.title")}
      </TypographyLarge>
      <ChannelPicker value={mention?.name} onSelect={setMention} />
      <Button
        disabled={mentionsPending || !mention?.id}
        onClick={() =>
          mention?.id &&
          mentionsMutate({
            action: "add",
            channelId: mention?.id,
          })
        }
      >
        {mentionsPending && <Loader2 size={12} className="animate-spin" />}
        {t("views.editor.channelMentions.add")}
      </Button>
      {video.mentions?.map((channel) => (
        <ChannelCard
          key={channel.id}
          {...channel}
          size="xs"
          showSubscribers={false}
        >
          <Button
            size="icon-lg"
            variant="ghost"
            className="text-red-11"
            disabled={mentionsPending}
            onClick={() =>
              mentionsMutate({ action: "del", channelIds: [channel.id] })
            }
          >
            <div className="i-heroicons:trash" />
          </Button>
        </ChannelCard>
      ))}
    </div>
  );
}
