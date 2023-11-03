import { currentVideoAtom } from "@/store/player";
import { useAtomValue } from "jotai";
import { useContext } from "react";
import { OutPortal } from "react-reverse-portal";
import { VideoPortalContext } from "../layout/Frame";
import { Link } from "react-router-dom";

export function MiniPlayer() {
  const VideoPortalNode = useContext(VideoPortalContext);
  const currentVideo = useAtomValue(currentVideoAtom);

  return (
    <div className="fixed inset-x-4 bottom-0 flex flex-col overflow-hidden rounded-t-lg bg-base sm:left-auto sm:w-96">
      <OutPortal node={VideoPortalNode} />
      <div className="flex flex-col p-4">
        <Link
          to={`/watch/${currentVideo?.id}`}
          className="line-clamp-1 font-bold"
        >
          {currentVideo?.title}
        </Link>
        <Link
          to={`/channel/${currentVideo?.channel.id}`}
          className="text-sm text-base-11"
        >
          {currentVideo?.channel.name}
        </Link>
      </div>
    </div>
  );
}
