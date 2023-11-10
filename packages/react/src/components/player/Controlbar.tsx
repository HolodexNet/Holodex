import { Button } from "@/shadcn/ui/button";
import { useTranslation } from "react-i18next";
import { VideoMenu } from "../video/VideoMenu";
import { useLocation, useNavigate } from "react-router-dom";
import { useAtom, useSetAtom } from "jotai";
import {
  chatOpenAtom,
  miniPlayerAtom,
  theaterModeAtom,
  tlOpenAtom,
} from "@/store/player";

interface ControlbarProps extends VideoBase {
  link?: string;
  onChatClick: () => void;
  onTLClick: () => void;
}

export function Controlbar({
  id,
  type,
  status,
  link,
  onChatClick,
  onTLClick,
  ...rest
}: ControlbarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const setMiniPlayer = useSetAtom(miniPlayerAtom);
  const [theaterMode, setTheaterMode] = useAtom(theaterModeAtom);
  const [chatOpen, setChatOpen] = useAtom(chatOpenAtom);
  const [tlOpen, setTlOpen] = useAtom(tlOpenAtom);

  const url = link?.includes("twitch") ? link : `https://youtu.be/${id}`;

  return (
    <div className="flex shrink-0 items-center gap-2 overflow-x-auto border-t-[1px] border-base px-4 py-2 text-base-11">
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
        onClick={onTLClick}
      >
        <div className="i-heroicons:chat-bubble-bottom-center-text" />
        TL
      </Button>
      <Button
        className="flex @screen-lg:hidden"
        variant="ghost"
        onClick={onChatClick}
      >
        <div className="i-heroicons:chat-bubble-left-right" />
        Chat
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
          Chat / TL
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
        {t("views.watch.theaterMode")}
      </Button>
      <Button
        className="whitespace-nowrap"
        variant="ghost"
        onClick={() => {
          location.state?.isMinimizable ? navigate(-1) : navigate("/");
          setMiniPlayer((v) => !v);
        }}
      >
        <div className="i-lucide:arrow-down-right-square" />
        Mini Player
      </Button>
      <Button variant="ghost">
        <div className="i-heroicons:arrow-path" />
        {t("component.apiError.reload")}
      </Button>
      <VideoMenu id={id} type={type} status={status} {...rest} url={url}>
        <Button className="shrink-0" size="icon" variant="ghost">
          <div className="i-heroicons:ellipsis-vertical" />
        </Button>
      </VideoMenu>
    </div>
  );
}
