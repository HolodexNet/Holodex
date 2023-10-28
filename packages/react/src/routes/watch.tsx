import { LiveChat } from "@/components/chat/LiveChat";
import { VideoPortalContext } from "@/components/layout/Frame";
import { Controlbar } from "@/components/player/Controlbar";
import { PlayerChannelCard } from "@/components/player/PlayerChannelCard";
import { PlayerStats } from "@/components/player/PlayerStats";
import { useVideo } from "@/services/video.service";
import { useContext } from "react";
import { OutPortal } from "react-reverse-portal";
import { useParams } from "react-router-dom";

export default function Watch() {
  const VideoPortalNode = useContext(VideoPortalContext);
  const { id } = useParams();
  const { data } = useVideo<PlaceholderVideo>(id ?? "", {
    enabled: !!id,
    refetchInterval: 1000 * 60 * 3,
  });

  const isTwitch = data?.link?.includes("twitch");

  return (
    <div className="h-full w-full @container">
      <div className="mx-auto flex w-full max-w-screen-2xl gap-8 p-4 @screen-lg:p-8">
        <div className="flex w-full flex-col gap-4">
          <div className="flex w-full flex-col overflow-hidden rounded-lg bg-base-4">
            <OutPortal
              node={VideoPortalNode}
              style={{
                aspectRatio: "16 / 9",
                boxShadow:
                  "var(--tw-ring-offset-shadow, 0 0 #0000), var(--tw-ring-shadow, 0 0 #0000), var(--tw-shadow)",
              }}
              width="100%"
              height="fit-content"
              controls
              url={isTwitch ? data?.link : `https://youtu.be/${id}`}
            />
            {data && <Controlbar {...data} />}
          </div>
          <div className="flex flex-col gap-1">
            <h2 className="text-xl font-bold">{data?.title}</h2>
            {data && <PlayerStats {...data} />}
          </div>
          <PlayerChannelCard id={data?.channel.id} />
          {!isTwitch && (
            <div className="rounded-lg bg-base-4 p-4">
              <div className="whitespace-pre-wrap text-sm">
                {data?.description}
              </div>
            </div>
          )}
        </div>
        {data && (
          <div className="hidden h-full w-96 shrink-0 @screen-lg:flex">
            <div className="flex h-[80vh] w-full rounded-lg border border-base">
              <LiveChat
                id={data.id}
                status={data?.status}
                channelId={data.channel.id}
                link={data.link}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
