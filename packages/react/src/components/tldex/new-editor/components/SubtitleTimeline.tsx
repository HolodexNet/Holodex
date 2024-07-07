import React from "react";
import { useAtom, useStore } from "jotai";
import { PrimitiveAtom } from "jotai";
import { subtitleAtomsAtom, useSubtitles } from "../hooks/subtitles";
import { Button } from "@/shadcn/ui/button";
import { formatDuration } from "@/lib/time";

const SubtitleTimeline = () => {
  const [subtitleAtoms] = useAtom(subtitleAtomsAtom);
  const { addSubtitle, deleteSubtitle } = useSubtitles();

  return (
    <div className="subtitle-timeline h-full overflow-y-auto bg-base-2">
      {subtitleAtoms.map((subtitleAtom, index) => (
        <SubtitleItem
          key={subtitleAtom.toString()}
          subtitleAtom={subtitleAtom}
          nextSubtitleAtom={subtitleAtoms[index + 1]}
          onDelete={deleteSubtitle}
          onAddSubtitle={addSubtitle}
        />
      ))}
    </div>
  );
};

interface SubtitleItemProps {
  subtitleAtom: PrimitiveAtom<ParsedMessage>;
  nextSubtitleAtom?: PrimitiveAtom<ParsedMessage>;
  onDelete: (subtitleAtom: PrimitiveAtom<ParsedMessage>) => void;
  onAddSubtitle: (subtitle: ParsedMessage) => void;
}

const SubtitleItem: React.FC<SubtitleItemProps> = ({
  subtitleAtom,
  nextSubtitleAtom,
  onDelete,
  onAddSubtitle,
}) => {
  const [subtitle, setSubtitle] = useAtom(subtitleAtom);
  const store = useStore();

  const handleDelete = () => onDelete(subtitleAtom);

  const handleMerge = () => {
    const nextSubtitle = nextSubtitleAtom ? store.get(nextSubtitleAtom) : null;
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

      onDelete(nextSubtitleAtom!);
    }
  };

  const handleAddSubtitle = () => {
    const nextSubtitle = nextSubtitleAtom ? store.get(nextSubtitleAtom) : null;
    if (nextSubtitle) {
      const newOffset = (subtitle.video_offset + nextSubtitle.video_offset) / 2;
      onAddSubtitle({
        message: "",
        timestamp: Date.now(),
        video_offset: newOffset,
        name: "New Subtitle",
        key: `subtitle-${Date.now()}`,
        parsed: "",
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
    <div className="subtitle-item flex border-b border-base-4 p-2 hover:bg-base-3">
      <div className="actions mr-2 flex flex-col space-y-1">
        <Button size="sm" variant="ghost" onClick={handleDelete} title="Delete">
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
      <div className="subtitle-content grow">
        <div className="subtitle-time text-xs text-base-11">
          {formatDuration(subtitle.video_offset * 1000)}
        </div>
        <textarea
          value={subtitle.message}
          onChange={handleChange}
          className="w-full rounded bg-base-1 p-1"
          rows={3}
        />
      </div>
    </div>
  );
};

export default SubtitleTimeline;
