import { ChatModal } from "@/components/chat/ChatModal";
import { LiveChat } from "@/components/chat/LiveChat";
import { VideoPortalContext } from "@/components/layout/Frame";
import { Controlbar } from "@/components/player/Controlbar";
import { PlayerChannelCard } from "@/components/player/PlayerChannelCard";
import { PlayerDescription } from "@/components/player/PlayerDescription";
import { PlayerRecommendations } from "@/components/player/PlayerRecommendations";
import { PlayerStats } from "@/components/player/PlayerStats";
import { TLChat } from "@/components/tldex/TLChat";
import { cn } from "@/lib/utils";
import { useVideo } from "@/services/video.service";
import { Button } from "@/shadcn/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/shadcn/ui/collapsible";
import { clipLangAtom } from "@/store/i18n";
import { currentVideoAtom, miniPlayerAtom } from "@/store/player";
import { useAtom, useAtomValue, useSetAtom } from "jotai";
import { useContext, useEffect, useLayoutEffect, useState } from "react";
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
  const [chatOpen, setChatOpen] = useState(false);
  const [tlOpen, setTLOpen] = useState(false);

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
      <div className="mx-auto flex w-full max-w-screen-2xl gap-8 p-4 @screen-lg:p-8">
        <div className="flex w-full flex-col gap-4">
          <div className="flex w-full flex-col overflow-hidden rounded-lg bg-base-3">
            {!miniPlayer && <OutPortal node={VideoPortalNode} />}
            {data && (
              <Controlbar
                {...data}
                onChatClick={() => setChatOpen((v) => !v)}
                onTLClick={() => setTLOpen((v) => !v)}
              />
            )}
          </div>
          <div className="flex flex-col gap-1">
            <h2 className="text-xl font-bold">{data?.title}</h2>
            {data && <PlayerStats {...data} />}
          </div>
          <PlayerChannelCard id={data?.channel.id} />
          {!isTwitch && data?.description && (
            <PlayerDescription description={data.description} />
          )}
          <div className="flex @screen-lg:hidden">
            <PlayerRecommendations {...data} />
          </div>
        </div>
        <div className="hidden w-96 shrink-0 flex-col gap-4 @screen-lg:flex">
          {(data?.type === "stream" || data?.status === "live") && (
            <div
              className={cn(
                "bg-base-3 border-base flex w-full flex-col rounded-lg border overflow-hidden",
                { "h-[80vh] max-h-[80vh]": chatOpen || tlOpen },
              )}
            >
              <Collapsible
                open={chatOpen}
                className={cn("flex flex-col", {
                  grow: chatOpen,
                })}
              >
                <CollapsibleTrigger asChild>
                  <Button
                    size="lg"
                    variant="ghost"
                    className="flex w-full justify-start rounded-none px-4 py-2"
                    onClick={() => setChatOpen(!chatOpen)}
                  >
                    <div
                      className={
                        chatOpen ? "i-heroicons:minus" : "i-heroicons:plus"
                      }
                    />
                    {chatOpen ? "Close chat" : "Open chat"}
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent asChild>
                  <LiveChat
                    id={data.id}
                    status={data.status}
                    channelId={data.channel.id}
                    link={data.link}
                  />
                </CollapsibleContent>
              </Collapsible>
              <Collapsible
                className={cn("flex flex-col", {
                  grow: tlOpen,
                })}
              >
                <CollapsibleTrigger asChild>
                  <Button
                    size="lg"
                    variant="ghost"
                    className="flex w-full justify-start rounded-none px-4 py-2"
                    onClick={() => setTLOpen(!tlOpen)}
                  >
                    <div
                      className={
                        tlOpen ? "i-heroicons:minus" : "i-heroicons:plus"
                      }
                    />
                    {tlOpen ? "Close TL" : "Open TL"}
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent asChild>
                  <TLChat videoId={data.id} />
                </CollapsibleContent>
              </Collapsible>
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
