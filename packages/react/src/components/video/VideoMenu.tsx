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
import { ReactNode, Suspense, lazy, useState } from "react";
import { useTranslation } from "react-i18next";
import { Link } from "react-router-dom";
import { useCopyToClipboard } from "usehooks-ts";
import { useToast } from "@/shadcn/ui/use-toast";
import { useAtom } from "jotai";
import { queueAtom } from "@/store/queue";
import { VideoCardType } from "./VideoCard";

const LazyNewPlaylistDialog = lazy(
  () => import("@/components/playlist/NewPlaylistDialog"),
);

interface VideoMenuProps {
  video: VideoCardType;
  children: ReactNode;
  url?: string;
}

export function VideoMenu({ children, video, url }: VideoMenuProps) {
  const videoId = video.id;
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
      <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
      <DropdownMenuContent
        onClick={(e) => e.stopPropagation()}
        // className="border-base-5"
      >
        <DropdownMenuItem
          className="flex gap-2"
          onClick={() =>
            setQueue((q) =>
              isQueued ? q.filter(({ id }) => videoId !== id) : [...q, video],
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
            <Link className="flex gap-2" to={`/edit/video/${videoId}`}>
              <div className="i-heroicons:pencil" />
              {t("component.videoCard.edit")}
            </Link>
          </DropdownMenuItem>
        )}
        {video.type !== "clip" && (
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
                <Suspense
                  fallback={
                    <div className="i-lucide:loader-2 animate-spin leading-none" />
                  }
                >
                  <LazyNewPlaylistDialog
                    triggerElement={
                      <DropdownMenuItem
                        onSelect={(event) => event.preventDefault()}
                      >
                        {t("component.playlist.menu.new-playlist")}
                      </DropdownMenuItem>
                    }
                    videoIds={[videoId]}
                  />
                </Suspense>
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
