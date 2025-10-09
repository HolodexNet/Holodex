import { cn } from "@/lib/utils";
import { Button } from "@/shadcn/ui/button";
import {
  mutateVideoToPlaceholderAtom,
  readMultiviewCellsAtom,
  removeVideoCellAtom,
} from "@/store/multiview";
import { videoStatusAtomFamily } from "@/store/player";
import { useAtomValue, useSetAtom } from "jotai";

interface VideoCellControlProps {
  id: string;
}

export function VideoCellControl({ id }: VideoCellControlProps) {
  const switchToPlaceholder = useSetAtom(mutateVideoToPlaceholderAtom);
  const removeVideo = useSetAtom(removeVideoCellAtom);
  const videoStatusAtom = videoStatusAtomFamily(id || "x");
  const statusValue = useAtomValue(videoStatusAtom);
  const { cells } = useAtomValue(readMultiviewCellsAtom);
  const cell = cells.find((cell) => cell.i === `video_${id}`);
  const dimensions = `${cell?.w} x ${cell?.h}`;

  return (
    <div
      className={cn(
        "flex justify-between w-full items-center transition-transform duration-200 ease-out p-2",
        statusValue.status === "playing"
          ? "transform translate-y-full opacity-0 h-0 p-0"
          : "transform translate-y-0 opacity-100",
      )}
    >
      <Button
        onClick={() => switchToPlaceholder(id)}
        onMouseDown={(e) => e.stopPropagation()}
        onPointerDown={(e) => e.stopPropagation()}
        className={cn("rounded-md p-2 hover:bg-slate-5")}
        variant="secondary"
      >
        <div
          className={cn("i-heroicons:chevron-left", "text-lg text-base-11")}
        />
      </Button>
      <div className="text-sm text-base-11">{dimensions}</div>
      <Button
        onClick={() => removeVideo(id)}
        onMouseDown={(e) => e.stopPropagation()}
        onPointerDown={(e) => e.stopPropagation()}
        className={cn("rounded-md p-2 hover:bg-slate-5")}
        variant="destructive"
      >
        <div className={cn("i-heroicons:trash", "text-lg text-base-11")} />
      </Button>
    </div>
  );
}
