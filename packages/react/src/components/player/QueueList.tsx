import { queueAtom } from "@/store/queue";
import { useAtom } from "jotai";
import { VideoCard } from "../video/VideoCard";
import { useTranslation } from "react-i18next";
import { Button } from "@/shadcn/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/shadcn/ui/collapsible";
import { useMemo, useState } from "react";
import NewPlaylistDialog from "../playlist/NewPlaylistDialog";
import { WATCH_PAGE_DROPDOWN_BUTTON_STYLE } from "@/shadcn/ui/button.variants";

export function QueueList({ currentId }: { currentId?: string }) {
  const { t } = useTranslation();
  const [queue, setQueue] = useAtom(queueAtom);
  // currentIdInQueue:
  const currentIdIdxInQueue = useMemo(() => {
    return currentId && queue.findIndex(({ id }) => currentId === id) + 1;
  }, [currentId, queue]);
  const [open, setOpen] = useState(!!currentIdIdxInQueue);

  return (
    <Collapsible
      open={open}
      className="flex flex-col gap-2 overflow-hidden rounded-lg border border-base bg-base-3 @container"
    >
      <CollapsibleTrigger asChild>
        <Button
          size="lg"
          variant="ghost"
          className={WATCH_PAGE_DROPDOWN_BUTTON_STYLE}
          onClick={() => setOpen(!open)}
        >
          <div className={open ? "i-heroicons:minus" : "i-heroicons:plus"} />
          {t("component.queue.title")}
          <span className="ml-auto text-sm text-base-11">
            {currentIdIdxInQueue ? currentIdIdxInQueue + " / " : ""}
            {queue.length} items
          </span>
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent>
        {open && (
          <div className="flex max-h-[40vh] flex-col overflow-y-auto">
            <div className="flex justify-between">
              <NewPlaylistDialog
                triggerElement={
                  <Button variant="ghost">
                    <div className="i-heroicons:plus-circle" />
                    {t("component.playlist.menu.new-playlist")}
                  </Button>
                }
                videoIds={queue.map(({ id }) => id)}
              />

              <Button variant="ghost" onClick={() => setQueue([])}>
                Clear
              </Button>
            </div>
            <div className="flex flex-col px-2">
              {queue.map((video) => (
                <VideoCard showDuration={false} size="sm" video={video} />
              ))}
            </div>
          </div>
        )}
      </CollapsibleContent>
    </Collapsible>
  );
}
