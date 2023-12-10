import { ChannelCard } from "@/components/channel/ChannelCard";
import { ChatModal } from "@/components/chat/ChatModal";
import { ChatCard } from "@/components/player/ChatCard";
import { Controlbar } from "@/components/player/Controlbar";
import { DefaultPlayerPositionAnchor } from "@/components/player/DefaultPlayerPositionAnchor";
import { PlayerDescription } from "@/components/player/PlayerDescription";
import { PlayerRecommendations } from "@/components/player/PlayerRecommendations";
import { PlayerStats } from "@/components/player/PlayerStats";
import { QueueList } from "@/components/player/QueueList";
import { cn } from "@/lib/utils";
import { useChannel } from "@/services/channel.service";
import { useVideo } from "@/services/video.service";
import { clipLangAtom } from "@/store/i18n";
import {
  QueueVideo,
  chatOpenAtom,
  chatPosAtom,
  currentVideoAtom,
  miniPlayerAtom,
  queueAtom,
  theaterModeAtom,
  tlOpenAtom,
} from "@/store/player";
import { VideoContext } from "@/store/videoContext";
import { useAtom, useAtomValue } from "jotai";
import { useEffect, useLayoutEffect } from "react";
import { Helmet } from "react-helmet-async";
import { useLocation, useParams } from "react-router-dom";
import useMeasure from "react-use-measure";

export default function Watch() {
  const location = useLocation();
  const { id } = useParams();
  const { value: clipLang } = useAtomValue(clipLangAtom);
  const { data, isSuccess } = useVideo<PlaceholderVideo>(
    { id: id!, lang: clipLang, c: "1" },
    {
      enabled: !!id,
      refetchInterval: 1000 * 60 * 3,
    },
  );
  const { data: channel } = useChannel(data?.channel.id ?? "", {
    enabled: !!data,
  });
  const [currentVideo, setCurrentVideo] = useAtom(currentVideoAtom);
  const [queue, setQueue] = useAtom(queueAtom);
  const [miniPlayer, setMiniPlayer] = useAtom(miniPlayerAtom);
  const theaterMode = useAtomValue(theaterModeAtom);
  const [chatOpen, setChatOpen] = useAtom(chatOpenAtom);
  const [tlOpen, setTLOpen] = useAtom(tlOpenAtom);
  const chatPos = useAtomValue(chatPosAtom);
  const [ref, bounds] = useMeasure({ debounce: 50, scroll: false });

  // Preload video frames for better experience
  useLayoutEffect(() => {
    const videoPlaceholder: QueueVideo = location.state.video ?? {
      id: id!,
      url: `https://youtu.be/${id}`,
      channel_id: "",
      title: "",
      description: "",
      type: "stream",
      topic_id: null,
      published_at: null,
      duration: 0,
      status: "live",
      start_scheduled: null,
      start_actual: null,
      end_actual: null,
      live_viewers: null,
      songcount: 0,
      channel: {
        id: "",
        name: "",
        type: "vtuber",
      },
    };
    videoPlaceholder.url =
      location.state?.video?.link?.includes("twitch") ??
      data?.link?.includes("twitch")
        ? location.state.video?.link
        : `https://youtu.be/${id}`;
    setMiniPlayer(false);
    setCurrentVideo(videoPlaceholder);
    if (queue.length)
      setQueue((q) =>
        q.some((v) => v.id === id)
          ? q
          : q.toSpliced(
              q.findIndex((q) => q.id === currentVideo?.id) + 1,
              0,
              videoPlaceholder,
            ),
      );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (isSuccess) {
      setCurrentVideo({
        ...data,
        url:
          location.state?.video?.link?.includes("twitch") ??
          data?.link?.includes("twitch")
            ? data.link
            : `https://youtu.be/${id}`,
      });
      if (queue.length)
        setQueue((q) =>
          q.toSpliced(
            q.findIndex((q) => q.id === id),
            1,
            {
              ...data,
              url:
                location.state?.video?.link?.includes("twitch") ??
                data?.link?.includes("twitch")
                  ? data.link
                  : `https://youtu.be/${id}`,
            },
          ),
        );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSuccess, id]);

  return (
    <VideoContext.Provider value={null}>
      <Helmet>
        <title>{data?.title}</title>
        <meta name="description" content={data?.description} />
      </Helmet>
      <div className="flex h-full w-full  @container" ref={ref}>
        <div
          className={cn("mx-auto flex w-full gap-8", {
            "@screen-lg:p-8 p-4 max-w-screen-2xl": !theaterMode,
          })}
        >
          <div className={cn("flex w-full flex-col gap-4")}>
            <div
              className={cn("bg-base-3 flex w-full flex-col", [
                theaterMode
                  ? "aspect-video @screen-lg:h-[calc(100dvh_-_var(--header-height))]"
                  : "rounded-lg overflow-hidden",
              ])}
            >
              {!miniPlayer && (
                <div
                  className={cn("w-full h-full flex", {
                    "flex-row-reverse": chatPos === "left",
                  })}
                >
                  <DefaultPlayerPositionAnchor
                    className="h-full w-full"
                    style={{ aspectRatio: theaterMode ? "" : "16 / 9" }}
                  />
                  {theaterMode && data && (chatOpen || tlOpen) && (
                    <div className="hidden min-w-[24rem] @screen-lg:flex">
                      <ChatCard {...data} />
                    </div>
                  )}
                </div>
              )}
              {currentVideo && <Controlbar {...(data ?? currentVideo)} />}
            </div>
            <div
              className={cn("flex flex-col gap-1", {
                "px-4 @screen-lg:px-8 py-4": theaterMode,
              })}
            >
              <h2 className="text-xl font-bold">{data?.title}</h2>
              {currentVideo && <PlayerStats {...(data ?? currentVideo)} />}
            </div>
            <div
              className={cn("flex flex-col gap-4", {
                "px-4 @screen-lg:px-8 pb-8": theaterMode,
              })}
            >
              {channel && <ChannelCard size="xs" {...channel} />}
              {!data?.link?.includes("twitch") && data?.description && (
                <PlayerDescription description={data.description} />
              )}
              <div className="flex @screen-lg:hidden">
                <PlayerRecommendations {...data} />
              </div>
            </div>
          </div>
          {!theaterMode && (
            <div className="hidden w-96 shrink-0 flex-col gap-4 @screen-lg:flex">
              {!!queue.length && <QueueList />}
              {(data?.type === "stream" || data?.status === "live") && (
                <div
                  className={cn(
                    "border-base rounded-lg border overflow-hidden",
                    {
                      "h-[80vh] max-h-[80vh]": chatOpen || tlOpen,
                    },
                  )}
                >
                  <ChatCard {...data} />
                </div>
              )}
              <PlayerRecommendations {...data} />
            </div>
          )}
        </div>
        {data && bounds.width < 1023 && (
          <ChatModal
            tlOpen={tlOpen}
            chatOpen={chatOpen}
            id={data.id}
            status={data.status}
            channelId={data.channel.id}
          />
        )}
      </div>
    </VideoContext.Provider>
  );
}
