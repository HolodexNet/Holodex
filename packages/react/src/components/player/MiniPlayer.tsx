import { miniplayerVideoAtom } from "@/store/player";
import { useAtomValue } from "jotai";
import { Link } from "react-router-dom";
import { PlayerWrapper } from "../layout/PlayerWrapper";
import { idToVideoURL } from "@/lib/utils";

export function MiniPlayer() {
  const currentVideo = useAtomValue(miniplayerVideoAtom);

  return (
    <div className="flex flex-col overflow-hidden fixed bottom-0 sm:left-auto inset-x-4 rounded-t-lg bg-base sm:w-96">
      {currentVideo && (
        <PlayerWrapper
          // className="aspect-video w-full"
          id={currentVideo.id}
          url={idToVideoURL(currentVideo.id, currentVideo.link)}
        />
      )}
      <div className="flex flex-col p-4">
        <Link
          to={`/watch/${currentVideo?.id}`}
          className="line-clamp-1 font-bold"
        >
          {currentVideo?.title}
        </Link>
        <Link
          to={`/channel/${currentVideo?.channel?.id}`}
          className="text-sm text-base-11"
        >
          {currentVideo?.channel?.name}
        </Link>
      </div>
    </div>
  );
}
