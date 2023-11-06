import { ChatModal } from "@/components/chat/ChatModal";
import { VideoPortalContext } from "@/components/layout/Frame";
import { ChatCard } from "@/components/player/ChatCard";
import { Controlbar } from "@/components/player/Controlbar";
import { PlayerChannelCard } from "@/components/player/PlayerChannelCard";
import { PlayerDescription } from "@/components/player/PlayerDescription";
import { PlayerRecommendations } from "@/components/player/PlayerRecommendations";
import { PlayerStats } from "@/components/player/PlayerStats";
import { cn } from "@/lib/utils";
import { useVideo } from "@/services/video.service";
import { clipLangAtom } from "@/store/i18n";
import {
  chatOpenAtom,
  chatPosAtom,
  currentVideoAtom,
  miniPlayerAtom,
  theaterModeAtom,
  tlOpenAtom,
} from "@/store/player";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { useContext, useEffect, useLayoutEffect } from "react";
import { OutPortal } from "react-reverse-portal";
import { useParams } from "react-router-dom";

export default function Watch() {
  const VideoPortalNode = useContext(VideoPortalContext);
  const { id } = useParams();
  const { value: clipLang } = useAtomValue(clipLangAtom);
  const { data, isSuccess } = useVideo<PlaceholderVideo>(
    { id: id!, lang: clipLang, c: "1" },
    {
      enabled: !!id,
      refetchInterval: 1000 * 60 * 3,
    },
  );
  const setCurrentVideo = useSetAtom(currentVideoAtom);
  const [miniPlayer, setMiniPlayer] = useAtom(miniPlayerAtom);
  const theaterMode = useAtomValue(theaterModeAtom);
  const [chatOpen, setChatOpen] = useAtom(chatOpenAtom);
  const [tlOpen, setTLOpen] = useAtom(tlOpenAtom);
  const chatPos = useAtomValue(chatPosAtom);

  const isTwitch = data?.link?.includes("twitch");

  useLayoutEffect(() => {
    setMiniPlayer(false);
    setCurrentVideo((curr) => ({
      ...curr,
      url: `https://youtu.be/${id}`,
    }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (isSuccess) {
      setCurrentVideo({
        ...data,
        url: isTwitch ? data.link : `https://youtu.be/${id}`,
      });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isSuccess]);

  return (
    <div className="flex h-full w-full @container">
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
                : "rounded-lg",
            ])}
          >
            {!miniPlayer && (
              <div
                className={cn("w-full h-full flex", {
                  "flex-row-reverse": chatPos === "left",
                })}
              >
                <OutPortal
                  style={{ aspectRatio: theaterMode ? "" : "16 / 9" }}
                  height="100%"
                  node={VideoPortalNode}
                />
                {theaterMode && data && (chatOpen || tlOpen) && (
                  <div className="hidden min-w-[24rem] @screen-lg:flex">
                    <ChatCard {...data} />
                  </div>
                )}
              </div>
            )}
            {data && (
              <Controlbar
                {...data}
                onChatClick={() => setChatOpen((v) => !v)}
                onTLClick={() => setTLOpen((v) => !v)}
              />
            )}
          </div>
          <div
            className={cn("flex flex-col gap-1", {
              "px-4 @screen-lg:px-8 py-4": theaterMode,
            })}
          >
            <h2 className="text-xl font-bold">{data?.title}</h2>
            {data && <PlayerStats {...data} />}
          </div>
          <div
            className={cn("flex flex-col gap-4", {
              "px-4 @screen-lg:px-8 pb-8": theaterMode,
            })}
          >
            <PlayerChannelCard id={data?.channel.id} />
            {!isTwitch && data?.description && (
              <PlayerDescription description={data.description} />
            )}
            <div className="flex @screen-lg:hidden">
              <PlayerRecommendations {...data} />
            </div>
          </div>
        </div>
        <div
          className={cn("hidden w-96 shrink-0 flex-col gap-4", {
            "@screen-lg:flex": !theaterMode,
          })}
        >
          {(data?.type === "stream" || data?.status === "live") && (
            <div
              className={cn("border-base rounded-lg border overflow-hidden", {
                "h-[80vh] max-h-[80vh]": chatOpen || tlOpen,
              })}
            >
              <ChatCard {...data} />
            </div>
          )}
          <PlayerRecommendations {...data} />
        </div>
      </div>
      {data && (
        <ChatModal
          tlOpen={tlOpen}
          chatOpen={chatOpen}
          id={data.id}
          status={data.status}
          channelId={data.channel.id}
        />
      )}
    </div>
  );
}
