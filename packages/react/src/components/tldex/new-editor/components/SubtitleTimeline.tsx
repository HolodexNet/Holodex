import React, { useState } from "react";
import { useAtom } from "jotai";
import { PrimitiveAtom } from "jotai";
import { subtitleAtomsAtom, useSubtitles } from "../hooks/subtitles";
import { Button } from "@/shadcn/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/shadcn/ui/popover";
import { formatDuration } from "@/lib/time";
import { Trash2, GitMerge, Plus } from "lucide-react";

const SubtitleTimeline = () => {
  const [subtitleAtoms] = useAtom(subtitleAtomsAtom);
  const { deleteSubtitle } = useSubtitles();

  return (
    <div className="subtitle-timeline h-full overflow-y-auto bg-base-2">
      {subtitleAtoms.map((subtitleAtom) => (
        <SubtitleItem
          key={subtitleAtom.toString()}
          subtitleAtom={subtitleAtom}
          onDelete={deleteSubtitle}
        />
      ))}
    </div>
  );
};

interface SubtitleItemProps {
  subtitleAtom: PrimitiveAtom<ParsedMessage>;
  onDelete: (subtitleAtom: PrimitiveAtom<ParsedMessage>) => void;
}

const SubtitleItem: React.FC<SubtitleItemProps> = ({
  subtitleAtom,
  onDelete,
}) => {
  const [subtitle] = useAtom(subtitleAtom);
  const [isEditing, setIsEditing] = useState(false);

  const handleDelete = () => onDelete(subtitleAtom);

  const handleMerge = () => {
    // Implement merge functionality
    console.log("Merge subtitle:", subtitle);
  };

  const handleInsert = () => {
    // Implement insert functionality
    console.log("Insert after subtitle:", subtitle);
  };

  return (
    <div className="subtitle-item flex items-center border-b border-base-4 p-2 hover:bg-base-3">
      <div className="actions mr-2 flex space-x-1">
        <Button size="sm" variant="ghost" onClick={handleDelete} title="Delete">
          <Trash2 size={16} />
        </Button>
        <Button size="sm" variant="ghost" onClick={handleMerge} title="Merge">
          <GitMerge size={16} />
        </Button>
        <Popover>
          <PopoverTrigger asChild>
            <Button size="sm" variant="ghost" title="Insert">
              <Plus size={16} />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-48">
            <div className="flex flex-col space-y-2">
              <Button size="sm" onClick={() => handleInsert()}>
                Insert Subtitle
              </Button>
              <Button size="sm" onClick={() => handleInsert()}>
                Insert Comment
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>
      <div className="subtitle-content grow" onClick={() => setIsEditing(true)}>
        <div className="subtitle-time text-xs text-base-11">
          {formatDuration(subtitle.video_offset * 1000)}
        </div>
        {isEditing ? (
          <input
            type="text"
            value={subtitle.message}
            onChange={(e) => {
              // Implement update functionality
              console.log("Update subtitle:", e.target.value);
            }}
            onBlur={() => setIsEditing(false)}
            className="w-full rounded bg-base-1 p-1"
          />
        ) : (
          <div className="subtitle-text">{subtitle.message}</div>
        )}
      </div>
    </div>
  );
};

export default SubtitleTimeline;
