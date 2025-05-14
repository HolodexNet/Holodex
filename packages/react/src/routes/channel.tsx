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

  if (!channelId || !channel) return <Loading size="md" />;

  return (
    <>
      <Helmet>
        <title>{preferredName} - Holodex</title>
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
        <Tabs
          value={location.pathname.split("/").at(-1)}
          onValueChange={(tab) =>
            tab !== "music" && navigate(`/channel/${channel?.id}/${tab}`)
          }
        >
          <div className="sticky top-0 z-20 flex flex-col gap-2 border-b border-b-base-5 bg-base-3 pt-4 shadow-lg md:gap-6">
            <div className="container flex items-start gap-4 px-4 max-sm:flex-col md:items-center md:px-8">
              <div className="flex items-center gap-4">
                <ChannelImg
                  className="size-16 md:size-24"
                  channelId={channel?.id}
                />
                <div className="flex flex-col overflow-hidden">
                  <div className="text-xs text-base-11">
                    {channel?.org}
                    {channel?.group && ` / ${channel?.group}`}
                  </div>
                  <div className="line-clamp-1 text-lg font-bold">
                    {preferredName}
                  </div>
                  <div className="text-sm text-base-11">
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
                  <div className="mt-1 flex max-w-full gap-1 overflow-x-auto">
                    {channel?.top_topics?.map((topic) => (
                      <TopicBadge
                        key={topic}
                        size="sm"
                        topic={topic}
                        className="border-base-7 capitalize text-base-10 "
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
                />
              </div>
            </div>
            <TabsList className="container justify-start overflow-x-auto bg-transparent md:px-8">
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
                  <div className="i-lucide:external-link text-lg" />
                </Link>
              </TabsTrigger>
              <TabsTrigger value="about">
                {t("views.channel.about")}
              </TabsTrigger>
            </TabsList>
          </div>
          <Outlet
            context={{ id: channelId, channel } satisfies ChannelOutletContext}
          />
        </Tabs>
      </div>
    </>
  );
}
