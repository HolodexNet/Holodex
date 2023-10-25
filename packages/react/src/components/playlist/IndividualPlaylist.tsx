import { usePlaylist } from "@/services/playlist.service";
import { VideoCard } from "@/components/video/VideoCard";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { TypographyH3, TypographyP } from "@/shadcn/ui/typography";
import { Button } from "@/shadcn/ui/button";
import { Separator } from "@/shadcn/ui/separator";

export default function IndividualPlaylist() {
  const { id } = useParams();

  const { data: playlist, status } = usePlaylist(parseInt(id!));

  const { t } = useTranslation();

  if (status === "pending") {
    return <div>Loading...</div>;
  }

  if (status === "error") {
    return <div>{t("component.apiError.title")}</div>;
  }

  return (
    <div className="container">
      <div className="flex items-center">
        <span className="i-solar:playlist-bold text-9xl !text-base-7" />
        <div className="ml-6">
          <TypographyH3>{playlist.name}</TypographyH3>
          <TypographyP className="!mt-1">
            {playlist.videos.length} Videos
          </TypographyP>
          <div className="flex gap-3 mt-4">
            <Button size="icon" variant="secondary">
              <span className="i-heroicons:play-solid" />
            </Button>
            <Button size="icon" variant="ghost">
              <span className="i-heroicons:trash-solid" />
            </Button>
          </div>
        </div>
      </div>
      <Separator className="mt-3 mb-7" />
      {playlist.videos.map((video, index) => {
        return (
          <div className="flex gap-2" key={video.id}>
            <div className="flex flex-col py-4 justify-between">
              <Button size="icon-lg" variant="ghost">
                <span className="i-heroicons:chevron-up-solid" />
              </Button>
              <Button size="icon-lg" variant="ghost">
                <span className="i-heroicons:chevron-down-solid" />
              </Button>
            </div>
            <div className="flex-grow">
              <VideoCard
                id={video.id}
                size="sm"
                channel={video.channel}
                channel_id={video.channel.id}
                type={video.type}
                title={`${index + 1}. ${video.title}`}
                description=""
                duration={video.duration}
                topic_id={video.topic_id}
                published_at={video.published_at}
                status={video.status}
                start_scheduled={null}
                start_actual={null}
                end_actual={null}
                live_viewers={null}
                songcount={0}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
