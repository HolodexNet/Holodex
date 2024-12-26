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
import HighlightBar from "./Highlightbar";

interface ControlbarProps {
  url?: string;
  video: PlaceholderVideo;
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
    <div className="flex flex-col border-t-[1px] border-base">
      <HighlightBar video={video} />
      <div className="flex shrink-0 items-center gap-0 overflow-x-auto px-4 pb-2 text-base-11 @screen-lg:gap-2">
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
                ? "i-hugeicons:square-arrow-shrink-01"
                : "i-hugeicons:square-arrow-expand-01"
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
        {/* <Button variant="ghost">
        <div className="i-heroicons:arrow-path" />
        <span className="hidden @screen-lg:block">
          {t("component.apiError.reload")}
        </span>
      </Button> */}
        <VideoMenu video={video} url={url}>
          <Button className="shrink-0" size="icon" variant="ghost">
            <div className="i-heroicons:ellipsis-vertical" />
          </Button>
        </VideoMenu>
      </div>
    </div>
  );
}
