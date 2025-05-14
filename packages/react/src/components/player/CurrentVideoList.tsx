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
import { useCurrentVideoList } from "@/hooks/useCurrentVideoList";
import { cn } from "@/lib/utils";

export function CurrentVideoList({ currentId }: { currentId?: string }) {
  const { t } = useTranslation();
  const { title, videos, clearList } = useCurrentVideoList();
  // currentIdInQueue:
  const currentIdIdxInQueue = useMemo(() => {
    return currentId && videos.findIndex(({ id }) => currentId === id) + 1;
  }, [currentId, videos]);
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
          {title}
          <span className="ml-auto text-sm text-base-11">
            {currentIdIdxInQueue ? currentIdIdxInQueue + " / " : ""}
            {videos.length} items
          </span>
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent>
        {open && (
          <div className="flex flex-col overflow-y-auto max-h-[40vh]">
            <div className="flex justify-between">
              <NewPlaylistDialog
                triggerElement={
                  <Button variant="ghost">
                    <div className="i-heroicons:plus-circle" />
                    {t("component.playlist.menu.new-playlist")}
                  </Button>
                }
                videoIds={videos.map(({ id }) => id)}
              />

              {clearList && (
                <Button variant="ghost" onClick={() => clearList()}>
                  Clear
                </Button>
              )}
            </div>
            <div className="flex flex-col gap-1">
              {videos.map((video) => (
                <VideoCard
                  key={"queue-" + video.id}
                  showDuration={false}
                  showStatus="available_at_only"
                  size="list"
                  video={video}
                  outerLayerStyle={cn(
                    "rounded-none px-2",
                    video.id === currentId && "bg-primary hover:bg-primary",
                  )}
                />
              ))}
            </div>
          </div>
        )}
      </CollapsibleContent>
    </Collapsible>
  );
}
