import { currentVideoAtom, queueAtom } from "@/store/player";
import { useAtom, useAtomValue } from "jotai";
import { VideoCard } from "../video/VideoCard";
import { useTranslation } from "react-i18next";
import { Button } from "@/shadcn/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/shadcn/ui/collapsible";
import { useState } from "react";
import NewPlaylistDialog from "../playlist/NewPlaylistDialog";
import { cn } from "@/lib/utils";

export function QueueList() {
  const [open, setOpen] = useState(true);
  const { t } = useTranslation();
  const currentVideo = useAtomValue(currentVideoAtom);
  const [queue, setQueue] = useAtom(queueAtom);

  return (
    <Collapsible
      open={open}
      className="flex flex-col gap-2 rounded-lg bg-base-3 @container"
    >
      <CollapsibleTrigger asChild>
        <Button
          size="lg"
          variant="ghost"
          className="justify-start px-4 font-bold"
          onClick={() => setOpen(!open)}
        >
          <div className={open ? "i-heroicons:minus" : "i-heroicons:plus"} />
          {t("component.queue.title")}
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <div className="flex flex-col py-2">
          <div className="flex justify-between px-4 pb-2">
            <NewPlaylistDialog
              triggerElement={
                <Button variant="ghost">
                  <div className="i-heroicons:plus-circle" />
                  {t("playlist")}
                </Button>
              }
              videoIds={queue.map(({ id }) => id)}
            />

            <Button variant="ghost" onClick={() => setQueue([])}>
              Clear
            </Button>
          </div>
          {queue.map((video) => (
            <div
              className={cn("px-4", {
                "bg-base-5": currentVideo?.id === video.id,
              })}
            >
              <VideoCard size="xs" {...video} />
            </div>
          ))}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
