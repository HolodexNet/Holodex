import {
  usePlaylistInclude,
  usePlaylistVideoMutation,
} from "@/services/playlist.service";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/shadcn/ui/dropdown-menu";
import { ReactNode, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import NewPlaylistDialog from "@/components/playlist/NewPlaylistDialog";

interface VideoMenuProps extends Pick<VideoBase, "id" | "type" | "status"> {
  children: ReactNode;
}

export function VideoMenu({
  children,
  id: videoId,
  type,
  status,
}: VideoMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useTranslation();
  const { data, isLoading } = usePlaylistInclude(videoId, { enabled: isOpen });
  const { mutate } = usePlaylistVideoMutation();

  return (
    <DropdownMenu onOpenChange={setIsOpen}>
      <DropdownMenuTrigger>{children}</DropdownMenuTrigger>
      <DropdownMenuContent onClick={(e) => e.stopPropagation()}>
        <DropdownMenuItem asChild>
          <Link
            className="flex gap-2"
            to={`https://youtu.be/${videoId}`}
            target="_blank"
          >
            <div className="i-mdi:youtube" />
            {t("views.settings.redirectModeLabel")}
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link className="flex gap-2" to={`/watch/${videoId}/edit`}>
            <div className="i-heroicons:pencil" />
            {t("component.videoCard.edit")}
          </Link>
        </DropdownMenuItem>
        {type !== "clip" && (
          <DropdownMenuItem asChild>
            <Link
              className="flex gap-2"
              to={`/multiview/AAUY${videoId}%2cUAEYchat`}
            >
              <div className="i-heroicons:rectangle-group" />
              {t("component.mainNav.multiview")}
            </Link>
          </DropdownMenuItem>
        )}
        <DropdownMenuGroup>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger className="flex gap-2">
              <div className="i-heroicons:queue-list" />
              {t("component.mainNav.playlist")}
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent>
                {data?.map(({ name, id }) => (
                  <DropdownMenuItem
                    key={id}
                    onClick={() => mutate({ id, videoId })}
                  >
                    {name}
                  </DropdownMenuItem>
                ))}
                {data?.length ? <DropdownMenuSeparator /> : null}
                {isLoading && (
                  <DropdownMenuItem className="justify-center" disabled>
                    <div className="i-lucide:loader-2 animate-spin leading-none" />
                  </DropdownMenuItem>
                )}
                <NewPlaylistDialog
                  triggerElement={
                    <DropdownMenuItem
                      onSelect={(event) => event.preventDefault()}
                    >
                      {t("component.playlist.menu.new-playlist")}
                    </DropdownMenuItem>
                  }
                  videoIds={[videoId]}
                />
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
        </DropdownMenuGroup>
        <DropdownMenuItem className="flex gap-2">
          <div className="i-heroicons:link" />
          {t("component.videoCard.copyLink")}
        </DropdownMenuItem>
        {status === "upcoming" && (
          <DropdownMenuItem className="flex gap-2">
            <div className="i-heroicons:calendar" />
            {t("component.videoCard.googleCalendar")}
          </DropdownMenuItem>
        )}
        <DropdownMenuItem className="flex gap-2">
          <div className="i-heroicons:newspaper" />
          {t("component.videoCard.openClient")}
        </DropdownMenuItem>
        {status === "past" && (
          <DropdownMenuItem className="flex gap-2">
            <div className="i-heroicons:document-arrow-up" />
            {t("component.videoCard.uploadScript")}
          </DropdownMenuItem>
        )}
        <DropdownMenuItem className="flex gap-2">
          <div className="i-heroicons:flag" />
          {t("component.reportDialog.title")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
