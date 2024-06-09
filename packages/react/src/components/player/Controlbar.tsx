import { Button } from "@/shadcn/ui/button";
import { useTranslation } from "react-i18next";
import { VideoMenu } from "../video/VideoMenu";
import { useLocation, useNavigate } from "react-router-dom";
import { useAtom, useSetAtom } from "jotai";
import {
  chatOpenAtom,
  miniPlayerAtom,
  miniplayerVideoAtom,
  theaterModeAtom,
  tlOpenAtom,
} from "@/store/player";
import { VideoCardType } from "../video/VideoCard";

interface ControlbarProps {
  url?: string;
  video: VideoCardType;
  // onChatClick: () => void;
  // onTLClick: () => void;
}

export function Controlbar({ video, url }: ControlbarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const setMiniPlayer = useSetAtom(miniPlayerAtom);
  const setMiniplayerVideo = useSetAtom(miniplayerVideoAtom);
  const [theaterMode, setTheaterMode] = useAtom(theaterModeAtom);
  const [chatOpen, setChatOpen] = useAtom(chatOpenAtom);
  const [tlOpen, setTlOpen] = useAtom(tlOpenAtom);

  return (
    <div className="flex shrink-0 items-center gap-0 overflow-x-auto border-t-[1px] border-base px-4 py-2 text-base-11 @screen-lg:gap-2">
      <Button
        className="flex shrink-0 @screen-md:hidden"
        size="icon"
        variant="ghost"
        onClick={() => navigate(-1)}
      >
        <div className="i-heroicons:arrow-left" />
      </Button>
      <Button
        title={t("views.watch.chat.showTLBtn")}
        className="flex @screen-lg:hidden"
        variant="ghost"
        onClick={() => {
          setTlOpen((v) => !v);
        }}
      >
        <div className="i-heroicons:chat-bubble-bottom-center-text" />
        <span>TL</span>
      </Button>
      <Button
        className="flex @screen-lg:hidden"
        variant="ghost"
        onClick={() => {
          setChatOpen((v) => !v);
        }}
      >
        <div className="i-heroicons:chat-bubble-left-right" />
        <span>Chat</span>
      </Button>
      {theaterMode && (
        <Button
          className="hidden @screen-lg:flex"
          variant="ghost"
          onClick={() => {
            setChatOpen(!(chatOpen || tlOpen));
            setTlOpen(!(chatOpen || tlOpen));
          }}
        >
          <div className="i-heroicons:chat-bubble-left-right" />
          <span>Chat / TL</span>
        </Button>
      )}
      <Button
        className="ml-auto whitespace-nowrap"
        variant="ghost"
        onClick={() => setTheaterMode((v) => !v)}
      >
        <div
          className={
            theaterMode
              ? "i-tabler:panorama-horizontal-off"
              : "i-tabler:panorama-horizontal"
          }
        />
        <span className="hidden @screen-lg:block">
          {t("views.watch.theaterMode")}
        </span>
      </Button>
      <Button
        className="whitespace-nowrap"
        variant="ghost"
        onClick={() => {
          location.state?.isMinimizable ? navigate(-1) : navigate("/");
          setMiniPlayer((v) => !v);
          setMiniplayerVideo(video);
        }}
      >
        <div className="i-lucide:arrow-down-right-square" />
        <span className="hidden @screen-lg:block">Mini Player</span>
      </Button>
      <Button variant="ghost">
        <div className="i-heroicons:arrow-path" />
        <span className="hidden @screen-lg:block">
          {t("component.apiError.reload")}
        </span>
      </Button>
      <VideoMenu video={video} url={url}>
        <Button className="shrink-0" size="icon" variant="ghost">
          <div className="i-heroicons:ellipsis-vertical" />
        </Button>
      </VideoMenu>
    </div>
  );
}
