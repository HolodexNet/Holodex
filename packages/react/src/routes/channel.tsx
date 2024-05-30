import { ChannelImg } from "@/components/channel/ChannelImg";
import { ChannelSocials } from "@/components/channel/ChannelSocials";
import { Loading } from "@/components/common/Loading";
import { TopicBadge } from "@/components/topic/TopicBadge";
import { formatCount } from "@/lib/time";
import { getChannelBannerImages } from "@/lib/utils";
import { useChannel } from "@/services/channel.service";
import { Tabs, TabsList, TabsTrigger } from "@/shadcn/ui/tabs";
import { ExternalLink } from "lucide-react";
import { useState } from "react";
import { Helmet } from "react-helmet-async";
import { useTranslation } from "react-i18next";
import { Link, Outlet, useNavigate, useParams } from "react-router-dom";

export type ChannelOutletContext = {
  id: string;
  channel: Channel;
};

export default function Channel() {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();

  const [tab, setTab] = useState("");

  const { data: channel } = useChannel(id!);

  const onTabChange = (tab: string) => {
    // Open Musicdex when selected music tab
    if (tab === "music") return open("https://music.holodex.net");

    setTab(tab);
    navigate(`/channel/${channel?.id}/${tab}`);
  };

  if (!id || !channel) return <Loading size="md" />;

  return (
    <>
      <Helmet>
        <title>{channel.name} - Holodex</title>
      </Helmet>
      <div className="w-full">
        <img
          className=""
          src={
            channel?.banner
              ? getChannelBannerImages(channel?.banner).banner
              : ""
          }
        />
        <Tabs value={tab} onValueChange={onTabChange}>
          <div className="bg-base-3 border-b-base-5 sticky top-0 z-50 flex flex-col gap-8 border-b-[1px] py-4 shadow-md">
            <div className="container flex items-center gap-4">
              <ChannelImg channelId={channel?.id} />
              <div className="flex flex-col overflow-hidden">
                <div className="text-base-11 text-xs">
                  {channel?.org}
                  {channel?.group && ` / ${channel?.group}`}
                </div>
                <div className="line-clamp-1 text-lg font-bold">
                  {channel?.name}
                </div>
                <div className="text-base-11 text-sm">
                  {t("component.channelInfo.subscriberCount", {
                    n: formatCount(channel?.subscriber_count ?? "0"),
                  })}
                  {` / ${t("component.channelInfo.videoCount", {
                    0: channel?.video_count ?? "0",
                  })}`}
                  {` / ${t("component.channelInfo.clipCount", {
                    n: channel?.clip_count ?? "0",
                  })}`}
                </div>
                <div className="mt-1 flex max-w-full gap-1 overflow-x-auto">
                  {channel?.top_topics?.map((topic) => (
                    <TopicBadge key={topic} size="sm" topic={topic} />
                  ))}
                </div>
              </div>
              <div className="ml-auto">
                <ChannelSocials
                  size="lg"
                  id={channel?.id}
                  twitter={channel?.twitter}
                  twitch={channel?.twitch}
                />
              </div>
            </div>
            <TabsList className="container justify-start bg-transparent py-0">
              <TabsTrigger value="">{t("views.channel.video")}</TabsTrigger>
              <TabsTrigger value="clips">
                {t("views.channel.clips")}
              </TabsTrigger>
              <TabsTrigger value="collabs">
                {t("views.channel.collabs")}
              </TabsTrigger>
              <TabsTrigger value="music" className="gap-2">
                {t("views.channel.music")}
                <ExternalLink size={16} />
              </TabsTrigger>
              <TabsTrigger value="about">
                {t("views.channel.about")}
              </TabsTrigger>
            </TabsList>
          </div>
          <Outlet context={{ id, channel } satisfies ChannelOutletContext} />
        </Tabs>
      </div>
    </>
  );
}
