import { Button } from "@/shadcn/ui/button";
import { useTranslation } from "react-i18next";
import { VideoMenu } from "../video/VideoMenu";
import { useNavigate } from "react-router-dom";

export function Controlbar({
  id,
  type,
  status,
}: Pick<Video, "id" | "type" | "status">) {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div className="text-base-11 flex items-center gap-2 overflow-x-auto px-4 py-2">
      <Button
        className="@screen-md:hidden flex shrink-0"
        size="icon"
        variant="ghost"
        onClick={() => navigate(-1)}
      >
        <div className="i-heroicons:arrow-left" />
      </Button>
      <Button className="@screen-lg:hidden flex" variant="ghost">
        <div className="i-heroicons:chat-bubble-bottom-center-text" />
        TL
      </Button>
      <Button className="@screen-lg:hidden flex" variant="ghost">
        <div className="i-heroicons:chat-bubble-left-right" />
        Chat
      </Button>
      <Button className="ml-auto whitespace-nowrap" variant="ghost">
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
