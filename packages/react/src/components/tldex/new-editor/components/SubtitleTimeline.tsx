import React from "react";
import { useAtomValue, useStore } from "jotai";
import { Button } from "@/shadcn/ui/button";
import { formatDuration } from "@/lib/time";
import { Textarea } from "@/shadcn/ui/textarea";
import {
  intervalTreeAtom,
  intervalTreeBumpAtom,
  subtitleAtomsMap,
  useSpecificSubtitle,
} from "../hooks/subtitles";
import { nanoid } from "nanoid";
import { useScriptEditorParams } from "../useScriptEditorParams";
import { videoStatusAtomFamily } from "@/store/player";
import clsx from "clsx";

const SubtitleTimeline = () => {
  const { id } = useScriptEditorParams();
  const intervalTree = useAtomValue(intervalTreeAtom);
  const videoStatusAtom = videoStatusAtomFamily(id);
  const bump = useAtomValue(intervalTreeBumpAtom); // bump is used to force re-render
  return (
    <div className="h-full overflow-y-auto bg-base-2">
      {intervalTree.items.map((subtitleAtom, index, arr) => (
        <SubtitleItem
          key={"editor" + subtitleAtom.value}
          subtitleId={subtitleAtom.value}
          nextSubtitleId={arr[index + 1]?.value}
          videoStatusAtom={videoStatusAtom}
        />
      ))}
    </div>
  );
};

interface SubtitleItemProps {
  subtitleId: string;
  nextSubtitleId?: string;
  videoStatusAtom: ReturnType<typeof videoStatusAtomFamily>;
}

const SubtitleItem = React.memo(
  ({ subtitleId, nextSubtitleId, videoStatusAtom }: SubtitleItemProps) => {
    const [subtitle, dispatch] = useSpecificSubtitle(subtitleId);
    const store = useStore();
    const { creditName } = useScriptEditorParams();
    const { progress } = useAtomValue(videoStatusAtom);

    const handleMerge = () => {
      if (nextSubtitleId) {
        const nsatom = subtitleAtomsMap.get(nextSubtitleId);
        const nextSubtitle = !!nsatom && store.get(nsatom);
        if (!nextSubtitle) return;
        const mergedMessage = `${subtitle.message} ${nextSubtitle.message}`;
        const mergedDuration =
          nextSubtitle.video_offset -
          subtitle.video_offset +
          (subtitle.duration ?? 1000);

        dispatch({
          type: "UPDATE_SUBTITLE",
          payload: {
            ...subtitle,
            message: mergedMessage,
            parsed: "",
            end: subtitle.video_offset + mergedDuration,
            duration: mergedDuration,
          },
        });
        dispatch({ type: "DELETE_SUBTITLE", payload: nextSubtitleId });
      }
    };

    const handleAddSubtitle = () => {
      const nsatom = !!nextSubtitleId && subtitleAtomsMap.get(nextSubtitleId);
      const nextSubtitle = !!nsatom && store.get(nsatom);
      const nextSubtitleOffset = !!nextSubtitle && nextSubtitle.video_offset;
      const newOffset = nextSubtitleOffset
        ? (subtitle.video_offset + nextSubtitleOffset) / 2
        : subtitle.end + 1;
      const duration = 3000;
      dispatch({
        type: "ADD_SUBTITLE",
        payload: {
          id: nanoid(),
          message: "",
          duration: duration,
          timestamp: null,
          video_offset: newOffset,
          end: newOffset + duration,
          name: creditName!, // must be present at this stage
          parsed: "",
          key: `subtitle-${Date.now()}`,
        },
      });
    };

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      dispatch({
        type: "UPDATE_SUBTITLE",
        payload: {
          ...subtitle,
          message: e.target.value,
          parsed: e.target.value,
        },
      });
    };

    return (
      <div
        className={clsx(
          "flex border-b border-base-4 py-1 hover:bg-base-3",
          progress > subtitle.video_offset &&
            progress < subtitle.end &&
            "bg-primaryA-4 border-primary-7",
          progress >= subtitle.end && "bg-base-2 opacity-80",
        )}
      >
        <div className="flex flex-col justify-between space-y-1 brightness-50">
          <Button
            size="sm"
            variant="ghost"
            onClick={() =>
              dispatch({ type: "DELETE_SUBTITLE", payload: subtitle.id })
            }
            title="Delete"
          >
            <i className="i-mdi:delete text-base" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleMerge}
            title="Merge"
            disabled={!nextSubtitleId}
          >
            <i className="i-mdi:call-merge text-base" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleAddSubtitle}
            title="Add Subtitle"
            disabled={!nextSubtitleId}
          >
            <i className="i-mdi:plus text-base" />
          </Button>
        </div>
        <div className="grow">
          <div className="text-xs text-base-11">
            {formatDuration(subtitle.video_offset * 1000)} -{" "}
            {subtitle.duration &&
              formatDuration(subtitle.video_offset * 1000 + subtitle.duration)}
          </div>
          <Textarea
            value={subtitle.message}
            onChange={handleChange}
            className="w-full rounded bg-base-1 p-1 text-sm"
            rows={3}
          />
        </div>
      </div>
    );
  },
);

export default SubtitleTimeline;
