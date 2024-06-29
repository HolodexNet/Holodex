import React, { useMemo, useState } from "react";
import { useAtomValue } from "jotai";
import { useTranslation } from "react-i18next";
import { Dialog, DialogContent } from "@/shadcn/ui/dialog";
import { Drawer, DrawerContent } from "@/shadcn/ui/drawer";
import { Button } from "@/shadcn/ui/button";
import { siteIsSmallAtom } from "@/hooks/useFrame";
import { VideoThumbnail } from "./VideoThumbnail";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/shadcn/ui/alert-dialog";
import { userAtom } from "@/store/auth";
import { VideoCardType } from "./VideoCard";
import { VideoCardCountdownToLive } from "./VideoCardCountdownToLive";

export default function VideoCardPlaceholder({
  open,
  setOpen,
  video,
}: {
  open: boolean;
  setOpen: (open: boolean) => void;
  video: VideoCardType;
}) {
  const { t } = useTranslation();
  const isSmall = useAtomValue(siteIsSmallAtom);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const user = useAtomValue(userAtom);

  const thumbnailSrc =
    video.type === "placeholder" && video.thumbnail
      ? `/statics/thumbnail/maxres/${btoa(video.thumbnail).replace("+", "-").replace("/", "_").replace(/=+$/, "")}.jpg`
      : `https://i.ytimg.com/vi/${video.id}/maxresdefault.jpg`;

  const deletePlaceholder = async () => {
    try {
      // Implement your delete logic here
      alert("Successfully deleted, probably.");
    } catch (e) {
      console.error(e);
      alert("Failed to delete");
    }
    setShowDeleteConfirm(false);
  };

  const content = useMemo(
    () => (
      <div className="grid gap-6 rounded-lg border border-solid border-base-6">
        <VideoThumbnail
          src={thumbnailSrc}
          alt="Stream Thumbnail"
          className="aspect-video max-h-[50vh] w-full rounded-sm bg-black object-cover"
        />
        <div className="grid gap-2 px-4">
          <h2 className="text-2xl font-bold">{video.title}</h2>
          <div className="flex items-center gap-2 text-base-10">
            <div className="i-heroicons:user -mb-1 mr-1 inline-block text-sm" />
            <span>{video.channel.name}</span>
          </div>
          <div className="flex items-center gap-2 text-base-10">
            <div className="i-heroicons:clock -mb-1 mr-1 inline-block text-sm" />
            <VideoCardCountdownToLive video={video} />
          </div>
        </div>
        <div className="grid gap-4 px-4 pb-4">
          <Button size="lg" variant="default" className="" asChild>
            <a href={video.link} target="_blank" rel="noopener noreferrer">
              <div
                className={
                  video.placeholderType === "scheduled-yt-stream"
                    ? "i-logos:youtube-icon mr-2"
                    : "i-heroicons:arrow-top-right-on-square mr-2"
                }
              />
              {video.placeholderType === "scheduled-yt-stream"
                ? t("component.placeholderVideo.scheduledEvent")
                : video.placeholderType === "external-stream"
                  ? t("component.placeholderVideo.streamPageBtn")
                  : t("component.placeholderVideo.eventPageBtn")}
            </a>
          </Button>
          <div className="flex flex-row">
            <div className="grow">
              <p>{t("component.placeholderVideo.creditTitleText")}</p>
              {video.credits?.discord && (
                <p>
                  {t("component.placeholderVideo.discordCredit", {
                    user: video.credits.discord.user,
                    guild: (
                      <strong>
                        <a
                          href={`https://discord.gg/${video.credits.discord.link}`}
                          className="inline-block"
                        >
                          <div className="i-logos:discord-icon mr-1 inline-block" />
                          {video.credits.discord.guildName}
                        </a>
                      </strong>
                    ),
                  })}
                </p>
              )}
              {video.credits?.datasource && (
                <p>
                  {t("component.placeholderVideo.datasourceCredit", {
                    0: video.credits.datasource.name,
                  })}
                  <strong>
                    <a href={video.credits.datasource.link}>
                      <div className="i-heroicons:arrow-top-right-on-square mr-1 inline-block" />
                      {video.credits.datasource.link}
                    </a>
                  </strong>
                </p>
              )}
              {video.credits?.bot && (
                <p>
                  {t("component.placeholderVideo.botCredit", {
                    0: video.credits.bot.name,
                    1: video.credits.bot.user,
                  })}
                  <strong>
                    <a href={video.credits.bot.link}>
                      <div className="i-heroicons:arrow-top-right-on-square mr-1 inline-block" />
                      {video.credits.bot.link}
                    </a>
                  </strong>
                </p>
              )}
              {video.credits?.editor && (
                <p>
                  {t("component.placeholderVideo.editorCredit", {
                    0: video.credits.editor.name,
                  })}
                </p>
              )}
            </div>
            {user && user.role !== "user" && (
              <div className="pl-6">
                <code className="text-sm">{video.id}</code>
                <Button variant="default" className="m-2" asChild>
                  <a href={`/add_placeholder?id=${video.id}`}>Edit</a>
                </Button>
                <AlertDialog
                  open={showDeleteConfirm}
                  onOpenChange={setShowDeleteConfirm}
                >
                  <AlertDialogTrigger asChild>
                    <Button variant="destructive" className="m-2">
                      Delete
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={deletePlaceholder}>
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            )}
          </div>
        </div>
      </div>
    ),
    [thumbnailSrc, video, t, user, showDeleteConfirm],
  );

  if (isSmall) {
    return (
      <Drawer open={open} onOpenChange={setOpen} modal={true}>
        <DrawerContent className="p-0" onClick={(e) => e.stopPropagation()}>
          {content}
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen} modal={true}>
      <DialogContent
        className="w-[80%] p-0 sm:max-w-[980px]"
        onClick={(e) => e.stopPropagation()}
      >
        {content}
      </DialogContent>
    </Dialog>
  );
}
