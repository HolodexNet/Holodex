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
import { useCopyToClipboard } from "usehooks-ts";
import { useToast } from "@/shadcn/ui/use-toast";
import { useAtom } from "jotai";
import { queueAtom } from "@/store/player";

interface VideoMenuProps extends VideoBase {
  children: ReactNode;
  url?: string;
}

export function VideoMenu({
  children,
  id: videoId,
  type,
  status,
  url,
  ...rest
}: VideoMenuProps) {
  const { toast } = useToast();
  const [, copy] = useCopyToClipboard();
  const [isOpen, setIsOpen] = useState(false);
  const { t } = useTranslation();
  const { data, isLoading } = usePlaylistInclude(videoId, { enabled: isOpen });
  const { mutate } = usePlaylistVideoMutation();
  const [queue, setQueue] = useAtom(queueAtom);

  const isQueued = queue.some(({ id }) => videoId === id);
  const isTwitch = url?.includes("twitch");

  return (
    <DropdownMenu onOpenChange={setIsOpen}>
      <DropdownMenuTrigger>{children}</DropdownMenuTrigger>
      <DropdownMenuContent onClick={(e) => e.stopPropagation()}>
        <DropdownMenuItem
          className="flex gap-2"
          onClick={() =>
            setQueue((q) =>
              isQueued
                ? q.filter(({ id }) => videoId !== id)
                : [...q, { id: videoId, type, status, url, ...rest }],
            )
          }
        >
          <div
            className={isQueued ? "i-lucide:list-x" : "i-lucide:list-plus"}
          />
          {isQueued
            ? t("views.watch.removeFromQueue")
            : t("views.watch.addToQueue")}
        </DropdownMenuItem>
        {url && (
          <DropdownMenuItem asChild>
            <Link className="flex gap-2" to={url} target="_blank">
              <div className={isTwitch ? "i-lucide:twitch" : "i-mdi:youtube"} />
              {isTwitch
                ? t("views.watch.openOnTwitch")
                : t("views.settings.redirectModeLabel")}
            </Link>
          </DropdownMenuItem>
        )}
        {!isTwitch && (
          <DropdownMenuItem asChild>
            <Link className="flex gap-2" to={`/watch/${videoId}/edit`}>
              <div className="i-heroicons:pencil" />
              {t("component.videoCard.edit")}
            </Link>
          </DropdownMenuItem>
        )}
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
        <DropdownMenuItem
          className="flex gap-2"
          onClick={() => {
            copy(`${window.origin}/watch/${videoId}`);
            toast({ title: t("component.toast.copiedToClipboard") });
          }}
        >
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
