import React from "react";
import { useAtom, useStore } from "jotai";
import { PrimitiveAtom } from "jotai";
import { Button } from "@/shadcn/ui/button";
import { formatDuration } from "@/lib/time";
import { Textarea } from "@/shadcn/ui/textarea";
import { useSubtitleManager } from "../hooks/subtitles";
import { nanoid } from "nanoid";

const SubtitleTimeline = () => {
  const { addSubtitle, deleteSubtitle, updateSubtitle, allSubtitles } =
    useSubtitleManager();

  return (
    <div className="h-full overflow-y-auto bg-base-2">
      {allSubtitles.map((subtitleAtom, index) => (
        <SubtitleItem
          key={subtitleAtom.toString()}
          subtitleAtom={subtitleAtom}
          nextSubtitleAtom={allSubtitles[index + 1]}
          onDelete={deleteSubtitle}
          onAddSubtitle={addSubtitle}
        />
      ))}
    </div>
  );
};

interface SubtitleItemProps {
  subtitleAtom: PrimitiveAtom<ParsedScripterMessage>;
  nextSubtitleAtom?: PrimitiveAtom<ParsedScripterMessage>;
  onDelete: (subtitleId: string) => void;
  onAddSubtitle: (subtitle: ParsedScripterMessage) => void;
}

const SubtitleItem = React.memo(
  ({
    subtitleAtom,
    nextSubtitleAtom,
    onDelete,
    onAddSubtitle,
  }: SubtitleItemProps) => {
    const [subtitle, setSubtitle] = useAtom(subtitleAtom);
    const store = useStore();

    const handleDelete = () => onDelete(subtitle.id);

    const handleMerge = () => {
      const nextSubtitle = nextSubtitleAtom
        ? store.get(nextSubtitleAtom)
        : null;
      if (nextSubtitle) {
        const mergedMessage = `${subtitle.message} ${nextSubtitle.message}`;
        const mergedDuration =
          nextSubtitle.video_offset -
          subtitle.video_offset +
          (subtitle.duration ?? 1000);

        setSubtitle((prev) => ({
          ...prev,
          message: mergedMessage,
          parsed: mergedMessage,
          duration: mergedDuration,
        }));

        onDelete(nextSubtitle.id!);
      }
    };

    const handleAddSubtitle = () => {
      const nextSubtitle = nextSubtitleAtom
        ? store.get(nextSubtitleAtom)
        : null;
      if (nextSubtitle) {
        const newOffset =
          (subtitle.video_offset + nextSubtitle.video_offset) / 2;
        const newTimestamp =
          subtitle.timestamp + newOffset - subtitle.video_offset;
        onAddSubtitle({
          id: nanoid(),
          message: "",
          duration: 3000,
          timestamp: newTimestamp,
          video_offset: newOffset,
          end: newOffset + 3000,
          name: "Uncredited User TODO",
          parsed: "",
          key: `subtitle-${Date.now()}`,
        });
      }
    };

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      setSubtitle((prev) => ({
        ...prev,
        message: e.target.value,
        parsed: e.target.value,
      }));
    };

    return (
      <div className="flex border-b border-base-4 py-1 hover:bg-base-3">
        <div className="flex flex-col justify-between space-y-1 brightness-50">
          <Button
            size="sm"
            variant="ghost"
            onClick={handleDelete}
            title="Delete"
          >
            <i className="i-mdi:delete text-base" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleMerge}
            title="Merge"
            disabled={!nextSubtitleAtom}
          >
            <i className="i-mdi:call-merge text-base" />
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={handleAddSubtitle}
            title="Add Subtitle"
            disabled={!nextSubtitleAtom}
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
