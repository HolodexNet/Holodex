import { ChannelImg } from "@/components/channel/ChannelImg";
import { ChannelSocials } from "@/components/channel/ChannelSocials";
import { Loading } from "@/components/common/Loading";
import { TopicBadge } from "@/components/topic/TopicBadge";
import { MUSICDEX_URL } from "@/lib/consts";
import { formatCount } from "@/lib/numbers";
import { getChannelBannerImages } from "@/lib/utils";
import { useChannel } from "@/services/channel.service";
import { Tabs, TabsList, TabsTrigger } from "@/shadcn/ui/tabs";
import { usePreferredName } from "@/store/settings";
import { useState } from "react";
import { Helmet } from "@dr.pogodin/react-helmet";
import { useTranslation } from "react-i18next";
import {
  Link,
  Outlet,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";

export { default as ChannelVideos } from "./channel/ChannelVideos";

export type ChannelOutletContext = {
  id: string;
  channel: Channel;
};

export function Channel() {
  const { t } = useTranslation();
  const { channelId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  const [tab, setTab] = useState("");

  const { data: channel } = useChannel(channelId!);

  const preferredName = usePreferredName(channel ?? {});

  const getActiveTab = () => {
    const path = location.pathname;
    const channelBasePath = `/channel/${channelId}`;

    // If we're at the exact channel base path - it's the videos tab (index route)
    if (path === channelBasePath) {
      return "";
    }

    // For other routes, get the last segment
    const segments = path.split("/");
    return segments[segments.length - 1];
  };

  if (!channelId || !channel) return <Loading size="md" />;

  return (
    <>
      <Helmet>
        <title>{preferredName} - Holodex</title>
      </Helmet>
      <div className="w-full">
        <img
          className="w-full"
          src={
            channel?.banner
              ? getChannelBannerImages(channel?.banner).banner
              : ""
          }
        />
        <div className="flex flex-col gap-2 bg-card sticky top-0 border-b pt-4 shadow-lg z-20 border-b-base-5">
          <div className="mx-auto flex gap-4 items-start container px-4 md:px-8 max-sm:flex-col md:items-center">
            <div className="flex gap-4 items-center">
              <ChannelImg
                className="size-16 md:size-24"
                channelId={channel?.id}
              />
              <div className="flex flex-col overflow-hidden">
                <div className="text-xs text-muted-foreground">
                  {channel?.org}
                  {channel?.group && ` / ${channel?.group}`}
                </div>
                <div className="font-bold line-clamp-1 text-lg">
                  {preferredName}
                </div>
                <div className="text-muted-foreground text-sm">
                  {t("component.channelInfo.subscriberCount", {
                    n: formatCount(channel?.subscriber_count ?? "0"),
                  })}
                  {/* {` / ${t("component.channelInfo.videoCount", {
                      0: channel?.video_count ?? "0",
                      })}`}
                      {` / ${t("component.channelInfo.clipCount", {
                        n: channel?.clip_count ?? "0",
                        })}`} */}
                </div>
                <div className="flex mt-1 max-w-full gap-1 overflow-x-auto">
                  {channel?.top_topics?.map((topic) => (
                    <TopicBadge
                      key={topic}
                      size="sm"
                      topic={topic}
                      className="capitalize"
                    />
                  ))}
                </div>
              </div>
            </div>
            <div className="w-full md:ml-auto md:w-fit">
              <ChannelSocials
                size="lg"
                id={channel?.id}
                twitter={channel?.twitter}
                twitch={channel?.twitch}
                photo={channel?.photo}
                name={channel?.name}
                english_name={channel?.english_name}
                type={channel?.type}
              />
            </div>
          </div>

          <Tabs
            value={getActiveTab()}
            onValueChange={(tab) =>
              tab !== "music" && navigate(`/channel/${channel?.id}/${tab}`)
            }
          >
            <TabsList className="container mx-auto overflow-x-auto md:px-8 bg-transparent">
              <TabsTrigger value="">{t("views.channel.video")}</TabsTrigger>
              <TabsTrigger value="clips">
                {t("views.channel.clips")}
              </TabsTrigger>
              <TabsTrigger value="collabs">
                {t("views.channel.collabs")}
              </TabsTrigger>
              <TabsTrigger value="music" className="gap-2" asChild>
                <Link
                  target="_blank"
                  to={MUSICDEX_URL + "/channel/" + channel?.id}
                >
                  {t("views.channel.music")}
                  <div className="text-lg i-lucide:external-link" />
                </Link>
              </TabsTrigger>
              <TabsTrigger value="about">
                {t("views.channel.about")}
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
        <Outlet
          context={{ id: channelId, channel } satisfies ChannelOutletContext}
        />
      </div>
    </>
  );
}
