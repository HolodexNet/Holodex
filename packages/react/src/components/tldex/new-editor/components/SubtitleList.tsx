import React from "react";
import { useAtomValue, useSetAtom } from "jotai";
import { Button } from "@/shadcn/ui/button";
import { formatDuration } from "@/lib/time";
import { Textarea } from "@/shadcn/ui/textarea";

import { nanoid } from "nanoid";
import { useScriptEditorParams } from "../useScriptEditorParams";
import { videoStatusAtomFamily } from "@/store/player";
import clsx from "clsx";
import { subtitleManagerAtom } from "../hooks/subtitles";

const SubtitleList = () => {
  const { id } = useScriptEditorParams();
  const manager = useAtomValue(subtitleManagerAtom);
  const videoStatusAtom = videoStatusAtomFamily(id!);
  return (
    <div className="h-full overflow-y-auto bg-base-2">
      {manager.subtitles.map((subtitle, index, arr) => (
        <SubtitleItem
          key={"editor" + subtitle.id}
          subtitleId={subtitle.id}
          subtitle={subtitle}
          nextSubtitleId={arr[index + 1]?.id}
          nextSubtitle={arr[index + 1]}
          videoStatusAtom={videoStatusAtom}
        />
      ))}
    </div>
  );
};

interface SubtitleItemProps {
  subtitleId: string;
  subtitle: ParsedScripterMessage;
  nextSubtitleId?: string;
  nextSubtitle?: ParsedScripterMessage;
  videoStatusAtom: ReturnType<typeof videoStatusAtomFamily>;
}

const SubtitleItem = React.memo(
  ({
    // subtitleId, (it's not used i guess)
    subtitle,
    nextSubtitle,
    nextSubtitleId,
    videoStatusAtom,
  }: SubtitleItemProps) => {
    const dispatch = useSetAtom(subtitleManagerAtom);
    // const store = useStore();
    const { creditName } = useScriptEditorParams();
    const { progress } = useAtomValue(videoStatusAtom);

    const handleMerge = () => {
      if (nextSubtitleId && nextSubtitle) {
        // const nsatom = subtitleAtomsMap.get(nextSubtitleId);
        // const nextSubtitle = !!nsatom && store.get(nsatom);
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
            <i className="text-base i-mdi:delete" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleMerge}
            title="Merge"
            disabled={!nextSubtitleId}
          >
            <i className="text-base i-mdi:call-merge" />
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
            className="w-full rounded p-1 text-sm bg-base-1"
            rows={3}
          />
        </div>
      </div>
    );
  },
);

export default SubtitleList;
