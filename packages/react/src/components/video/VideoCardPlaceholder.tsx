import { useMemo, useState } from "react";
import { useAtomValue } from "jotai";
import { useTranslation } from "react-i18next";
import { Dialog, DialogContent } from "@/shadcn/ui/dialog";
import { Drawer, DrawerContent } from "@/shadcn/ui/drawer";
import { Button } from "@/shadcn/ui/button";
import { ChevronsUpDown } from "lucide-react";
import { siteIsSmallAtom } from "@/hooks/useFrame";
import type { VideoCardType } from "./VideoCard";
import { makeYtThumbnailUrl } from "@/lib/utils";
import { VideoThumbnail } from "./VideoThumbnail";

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

  const thumbnailSrc =
    video.type === "placeholder"
      ? video.thumbnail
      : makeYtThumbnailUrl(video.id, "lg");

  const content = useMemo(
    () => (
      <div className="grid gap-6">
        <VideoThumbnail
          src={thumbnailSrc}
          alt="Stream Thumbnail"
          className="rounded-lg object-cover"
        />
        <div className="grid gap-2">
          <h2 className="text-2xl font-bold">{video.title}</h2>
          <div className="flex items-center gap-2 text-base-10">
            <div className="i-heroicons:user -mb-1 mr-1 inline-block text-sm" />
            <span>{video.channel.name}</span>
          </div>
          <div className="flex items-center gap-2 text-base-10">
            <div className="i-heroicons:clock -mb-1 mr-1 inline-block text-sm" />
            <span>Starts in 2 hours</span>
          </div>
        </div>
        <div className="grid gap-4">
          <p>
            Join us for an exciting deep sea exploration as we dive into the
            unknown and uncover the mysteries of the ocean floor. Our expert
            team of marine biologists will guide us through this incredible
            journey, sharing their knowledge and insights along the way.
          </p>
          <div className="flex justify-end">
            <Button variant="outline">Remind Me</Button>
            <Button className="ml-2">Join Stream</Button>
          </div>
        </div>
      </div>
    ),
    [],
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
        className="p-0 sm:max-w-[600px]"
        onClick={(e) => e.stopPropagation()}
      >
        {content}
      </DialogContent>
    </Dialog>
  );
}
