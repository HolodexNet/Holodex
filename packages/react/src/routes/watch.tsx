import { ChannelCard } from "@/components/channel/ChannelCard";
import { Loading } from "@/components/common/Loading";
import { ChatCard } from "@/components/player/ChatCard";
import { Controlbar } from "@/components/player/Controlbar";
import { PlayerDescription } from "@/components/player/PlayerDescription";
import { PlayerRecommendations } from "@/components/player/PlayerRecommendations";
import { PlayerStats } from "@/components/player/PlayerStats";
// import { QueueList } from "@/components/player/QueueList";
import { cn } from "@/lib/utils";
import { useChannel } from "@/services/channel.service";
import { useVideo } from "@/services/video.service";
import { clipLangAtom } from "@/store/i18n";
import {
  chatOpenAtom,
  chatPosAtom,
  defaultPlayerEventBus,
  miniPlayerAtom,
  miniPlayerVideoAtom,
  theaterModeAtom,
  tlOpenAtom,
} from "@/store/player";
import { useAtom, useAtomValue } from "jotai";
import React from "react";
import { Suspense, useEffect, useLayoutEffect } from "react";
import { Helmet } from "react-helmet-async";
import { OnProgressProps } from "react-player/base";
import { Link, useLocation, useParams } from "react-router-dom";

const LazyReactPlayer = React.lazy(() => import("react-player"));

// =====Spec======
// Watch page needs to support three different layouts
// Full Standard Player
// Standard Player in Theather mode
// Mobile
// Mini Player (?Mobile)

export default function Watch() {
  const location = useLocation();
  const { id: idFromParam } = useParams();
  const [miniPlayer, setMiniPlayer] = useAtom(miniPlayerAtom);
  const [miniPlayerVideo, setMiniPlayerVideo] = useAtom(miniPlayerVideoAtom);

  const id = idFromParam ?? miniPlayerVideo?.id;

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

  // Watch Page state
  const theaterMode = useAtomValue(theaterModeAtom);
  const [chatOpen, setChatOpen] = useAtom(chatOpenAtom);
  const [tlOpen, setTLOpen] = useAtom(tlOpenAtom);
  const chatPos = useAtomValue(chatPosAtom);

  const preloadUrl =
    location.state?.video?.link?.includes("twitch") ??
    data?.link?.includes("twitch")
      ? location.state?.video?.link ?? data?.link
      : `https://youtu.be/${id}`;

  // Preload video frames for better experience
  useLayoutEffect(() => {
    if (location.pathname.startsWith("/watch")) setMiniPlayer(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, location]);

  useEffect(() => {
    if (isSuccess) {
      setMiniPlayerVideo(data);
    }
  }, [data, isSuccess, setMiniPlayerVideo]);

  return (
    <>
      <Helmet>
        <title>{data?.title}</title>
        <meta name="description" content={data?.description} />
      </Helmet>
      <div
        className={cn({
          "flex h-full w-full @container": !miniPlayer,
          "fixed bottom-0 flex flex-col overflow-hidden rounded-t-lg bg-base right-0 sm:w-96 z-10":
            miniPlayer,
        })}
      >
        <div
          className={cn({
            "@screen-lg:p-8 p-4 max-w-screen-2xl": !theaterMode,
            "mx-auto flex w-full gap-8": !miniPlayer,
          })}
        >
          <div className={cn("flex flex-col gap-4", { "w-full": !miniPlayer })}>
            <div
              className={cn("bg-base-3 flex w-full flex-col", [
                theaterMode
                  ? "aspect-video @screen-lg:h-[calc(100dvh_-_var(--header-height))]"
                  : "rounded-lg overflow-hidden",
              ])}
            >
              <div
                className={cn("w-full h-full flex", {
                  "flex-row-reverse": chatPos === "left",
                })}
              >
                <Suspense fallback={<Loading size="xl" />}>
                  <LazyReactPlayer
                    // pass `key` to prevent flicker issue https://github.com/CookPete/react-player/issues/413#issuecomment-395404630
                    key={preloadUrl}
                    style={{
                      aspectRatio: "16 / 9",
                    }}
                    width="100%"
                    height="100%"
                    url={preloadUrl}
                    controls
                    config={{
                      youtube: {
                        playerVars: {
                          origin: window.origin,
                          autoplay: 1,
                        },
                      },
                    }}
                    onStart={() =>
                      id && defaultPlayerEventBus.emit("onStart", id)
                    }
                    onPlay={() =>
                      id && defaultPlayerEventBus.emit("onPlay", id)
                    }
                    onPause={() =>
                      id && defaultPlayerEventBus.emit("onPause", id)
                    }
                    onBuffer={() =>
                      id && defaultPlayerEventBus.emit("onBuffer", id)
                    }
                    onBufferEnd={() =>
                      id && defaultPlayerEventBus.emit("onBufferEnd", id)
                    }
                    onClickPreview={(e: unknown) =>
                      id && defaultPlayerEventBus.emit("onClickPreview", id, e)
                    }
                    onError={(a: unknown, b: unknown, c: unknown, d: unknown) =>
                      id &&
                      defaultPlayerEventBus.emit("onError", id, a, b, c, d)
                    }
                    onEnablePIP={() =>
                      id && defaultPlayerEventBus.emit("onEnablePIP", id)
                    }
                    onDisablePIP={() =>
                      id && defaultPlayerEventBus.emit("onDisablePIP", id)
                    }
                    onProgress={(state: OnProgressProps) =>
                      id && defaultPlayerEventBus.emit("onProgress", id, state)
                    }
                    onDuration={(dur: number) =>
                      id && defaultPlayerEventBus.emit("onDuration", id, dur)
                    }
                    onSeek={(s: number) =>
                      id && defaultPlayerEventBus.emit("onSeek", id, s)
                    }
                    onEnded={() => {
                      id && defaultPlayerEventBus.emit("onEnded", id);
                      // advance to the next video?
                      // TODO move this behavior into the watch page.
                      // const nextVideo =
                      //   queue[queue.findIndex(({ id }) => currentVideo?.id === id) + 1] ??
                      //   currentVideo;
                      // setCurrentVideo(nextVideo);
                      // if (location.pathname.startsWith("/watch"))
                      //   navigate(`/watch/${nextVideo.id}`, {
                      //     state: { isMinimizable: false },
                      //   });
                    }}
                  />
                </Suspense>
                {!miniPlayer && theaterMode && data && (chatOpen || tlOpen) && (
                  <div className="hidden min-w-[24rem] @screen-lg:flex">
                    <ChatCard {...data} />
                  </div>
                )}
              </div>
              {!miniPlayer && data && <Controlbar {...data} />}
            </div>
            {miniPlayer && (
              <div className="flex flex-col p-4">
                <Link
                  to={`/watch/${miniPlayerVideo?.id}`}
                  className="line-clamp-1 font-bold"
                >
                  {miniPlayerVideo?.title}
                </Link>
                <Link
                  to={`/channel/${miniPlayerVideo?.channel?.id}`}
                  className="text-sm text-base-11"
                >
                  {miniPlayerVideo?.channel?.name}
                </Link>
              </div>
            )}
            {!miniPlayer && (
              <>
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
                  {channel && <ChannelCard size="xs" {...channel} />}
                  {!data?.link?.includes("twitch") && data?.description && (
                    <PlayerDescription description={data.description} />
                  )}
                  <div className="flex @screen-lg:hidden">
                    <PlayerRecommendations {...data} />
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
