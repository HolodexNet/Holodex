import React, { useState } from "react";
import { Button } from "@/shadcn/ui/button";
import { useTranslation } from "react-i18next";
import { useVideoTopicMutation } from "@/services/video.service";
import { useVideoSelection } from "@/hooks/useVideoSelection";
import { TopicPicker } from "@/components/topic/TopicPicker";

const SelectionFooterTopicPicker: React.FC = () => {
  const { t } = useTranslation();
  const [topic, setTopic] = useState<string | undefined>(undefined);
  const { mutate: topicMutate, isPending: topicPending } =
    useVideoTopicMutation();
  const { selectedVideos } = useVideoSelection();

  const handleMultisetTopic = () => {
    if (topic) {
      selectedVideos.forEach((video) => {
        topicMutate({ topicId: topic, videoId: video.id });
      });
    }
  };

  return (
    <div className="flex w-full items-center space-x-2">
      <div className="grow text-sm">
        <TopicPicker
          value={topic}
          onSelect={setTopic}
          buttonClass="h-6 text-sm"
        />
      </div>
      <Button
        size="sm"
        variant="primary"
        disabled={topicPending}
        onClick={handleMultisetTopic}
        className="whitespace-nowrap"
      >
        {topicPending && (
          <div className="i-lucide:loader-2 mr-2 animate-spin" />
        )}
        {topic
          ? t("component.multiset_topic.button", {
              videos: selectedVideos.length,
              topic: topic ?? "N/A",
            })
          : t("component.multiset_topic.unset", {
              videos: selectedVideos.length,
            })}
      </Button>
    </div>
  );
};

export default SelectionFooterTopicPicker;
