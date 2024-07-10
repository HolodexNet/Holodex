import React, { useState } from "react";
import { useSubtitles, subtitleAtomsAtom } from "../hooks/subtitles";
import { useAtom } from "jotai";
import { PrimitiveAtom } from "jotai";

const SubtitleTester: React.FC = () => {
  const { addSubtitle, deleteSubtitle, clearSubtitles } = useSubtitles();

  const [subtitleAtoms] = useAtom(subtitleAtomsAtom);
  const [newSubtitle, setNewSubtitle] = useState("");

  const handleAddSubtitle = () => {
    if (newSubtitle.trim()) {
      addSubtitle({
        message: newSubtitle,
        timestamp: Date.now(),
        video_offset: subtitleAtoms.length, // Just for demonstration
        name: "Test User",
        key: `subtitle-${Date.now()}`,
        parsed: newSubtitle,
      });
      setNewSubtitle("");
    }
  };

  return (
    <div
      style={{
        fontFamily: "Arial, sans-serif",
        maxWidth: "600px",
        margin: "0 auto",
        padding: "20px",
      }}
    >
      <h2>Subtitle Tester</h2>

      <div style={{ marginBottom: "20px" }}>
        <input
          type="text"
          value={newSubtitle}
          onChange={(e) => setNewSubtitle(e.target.value)}
          placeholder="Enter new subtitle"
          style={{ marginRight: "10px", padding: "5px" }}
        />
        <button onClick={handleAddSubtitle} style={{ padding: "5px 10px" }}>
          Add Subtitle
        </button>
      </div>

      <div style={{ marginBottom: "20px" }}>
        <button onClick={clearSubtitles} style={{ padding: "5px 10px" }}>
          Clear All
        </button>
      </div>

      <ul style={{ listStyle: "none", padding: 0 }}>
        {subtitleAtoms.map((subtitleAtom) => (
          <SubtitleItem
            key={subtitleAtom.toString()}
            subtitleAtom={subtitleAtom}
            onDelete={deleteSubtitle}
          />
        ))}
      </ul>
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
  const [subtitle, setSubtitle] = useAtom(subtitleAtom);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(subtitle.message);

  const handleSave = () => {
    if (subtitle.message !== editContent) {
      setSubtitle((prev) => ({
        ...prev,
        message: editContent,
        parsed: editContent,
      }));
    }
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditContent(subtitle.message);
    setIsEditing(false);
  };

  return (
    <li
      style={{
        marginBottom: "10px",
        border: "1px solid #ccc",
        padding: "10px",
      }}
    >
      {isEditing ? (
        <>
          <input
            type="text"
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            style={{ marginRight: "10px", padding: "5px" }}
          />
          <button
            onClick={handleSave}
            style={{ marginRight: "5px", padding: "5px 10px" }}
          >
            Save
          </button>
          <button onClick={handleCancel} style={{ padding: "5px 10px" }}>
            Cancel
          </button>
        </>
      ) : (
        <>
          <span>{subtitle.message}</span>
          <button
            onClick={() => setIsEditing(true)}
            style={{ marginLeft: "10px", padding: "5px 10px" }}
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(subtitleAtom)}
            style={{ marginLeft: "5px", padding: "5px 10px" }}
          >
            Delete
          </button>
        </>
      )}
    </li>
  );
};

export default SubtitleTester;
