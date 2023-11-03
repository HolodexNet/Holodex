import { Button } from "@/shadcn/ui/button";
import { useTranslation } from "react-i18next";
import { VideoMenu } from "../video/VideoMenu";
import { useNavigate } from "react-router-dom";
import { useSetAtom } from "jotai";
import { miniPlayerAtom } from "@/store/player";

interface ControlbarProps extends Pick<Video, "id" | "type" | "status"> {
  onChatClick: () => void;
  onTLClick: () => void;
}

export function Controlbar({
  id,
  type,
  status,
  onChatClick,
  onTLClick,
}: ControlbarProps) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const setMiniPlayer = useSetAtom(miniPlayerAtom);

  return (
    <div className="flex items-center gap-2 overflow-x-auto px-4 py-2 text-base-11">
      <Button
        className="flex shrink-0 @screen-md:hidden"
        size="icon"
        variant="ghost"
        onClick={() => navigate(-1)}
      >
        <div className="i-heroicons:arrow-left" />
      </Button>
      <Button
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
      <Button className="ml-auto whitespace-nowrap" variant="ghost">
        <div className="i-tabler:panorama-horizontal" />
        Theater mode
      </Button>
      <Button
        className="whitespace-nowrap"
        variant="ghost"
        onClick={() => {
          navigate(-1);
          setMiniPlayer((v) => !v);
        }}
      >
        <div className="i-lucide:arrow-down-right-square" />
        Mini Player
      </Button>
      <Button className="whitespace-nowrap" variant="ghost">
        <div className="i-heroicons:plus-circle" />
        Add to queue
      </Button>
      <Button variant="ghost">
        <div className="i-heroicons:arrow-path" />
        {t("component.apiError.reload")}
      </Button>
      <VideoMenu id={id} type={type} status={status}>
        <Button className="shrink-0" size="icon" variant="ghost">
          <div className="i-heroicons:ellipsis-vertical" />
        </Button>
      </VideoMenu>
    </div>
  );
}
