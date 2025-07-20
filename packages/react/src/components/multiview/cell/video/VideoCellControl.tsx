import { cn } from "@/lib/utils";
import { Button } from "@/shadcn/ui/button";
import {
  mutateVideoToPlaceholderAtom,
  removeVideoCellAtom,
} from "@/store/multiview";
import { videoStatusAtomFamily } from "@/store/player";
import { useAtomValue, useSetAtom } from "jotai";

interface VideoCellControlProps {
  id: string;
  buttonRef: React.RefObject<HTMLDivElement | null>;
}

export function VideoCellControl({ id, buttonRef }: VideoCellControlProps) {
  const switchToPlaceholder = useSetAtom(mutateVideoToPlaceholderAtom);
  const removeVideo = useSetAtom(removeVideoCellAtom);
  const videoStatusAtom = videoStatusAtomFamily(id || "x");
  const statusValue = useAtomValue(videoStatusAtom);

  return (
    <div
      ref={buttonRef}
      className={cn(
        "flex justify-between w-full items-center transition-transform duration-200 ease-out p-2",
        statusValue.status === "playing"
          ? "transform translate-y-full opacity-0 h-0"
          : "transform translate-y-0 opacity-100",
      )}
    >
      <Button
        onClick={() => switchToPlaceholder(id)}
        className={cn("rounded-md p-2 hover:bg-slate-5")}
        variant="secondary"
      >
        <div
          className={cn("i-heroicons:chevron-left", "text-lg text-base-11")}
        />
      </Button>
      <Button
        onClick={() => removeVideo(id)}
        className={cn("rounded-md p-2 hover:bg-slate-5")}
        variant="destructive"
      >
        <div className={cn("i-heroicons:trash", "text-lg text-base-11")} />
      </Button>
    </div>
  );
}
