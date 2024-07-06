import { atomWithUndo } from "@/lib/jotai/atomWithHistory";
import { PrimitiveAtom, atom, useAtom } from "jotai";
import { splitAtom } from "jotai/utils";
import { add } from "sorted-array-functions";

export function ParsedMessageComparator(a: ParsedMessage, b: ParsedMessage) {
  if (a.timestamp > b.timestamp) return 1;
  if (a.timestamp < b.timestamp) return -1;
  return 0;
}

export function ParsedMessageOFFSETComparator(
  a: ParsedMessage,
  b: ParsedMessage,
) {
  if (a.video_offset > b.video_offset) return 1;
  if (a.video_offset < b.video_offset) return -1;
  return 0;
}

const initialState: ParsedMessage[] = [];

export const subtitlesAtom = atom(initialState);
export const subtitlesUndoableAtom = atomWithUndo(subtitlesAtom, 100); // Limit to 100 undo steps
export const subtitleAtomsAtom = splitAtom(subtitlesAtom);

export const useSubtitles = () => {
  const [subtitles, setSubtitles] = useAtom(subtitlesAtom);
  const [{ undo, redo, canUndo, canRedo }] = useAtom(subtitlesUndoableAtom);
  const [_, dispatch] = useAtom(subtitleAtomsAtom);

  const addSubtitle = (subtitle: ParsedMessage) => {
    setSubtitles((oldSubtitles) => {
      const newSubtitles = [...oldSubtitles];
      add(newSubtitles, subtitle, ParsedMessageOFFSETComparator);
      return newSubtitles;
    });
  };

  const updateSubtitles = (newSubtitles: ParsedMessage[]) => {
    setSubtitles([...newSubtitles].sort(ParsedMessageOFFSETComparator));
  };

  const deleteSubtitle = (subtitleAtom: PrimitiveAtom<ParsedMessage>) =>
    dispatch({ type: "remove", atom: subtitleAtom });

  const clearSubtitles = () => {
    setSubtitles([]);
  };

  return {
    subtitles,
    updateSubtitles,
    addSubtitle,
    deleteSubtitle,
    clearSubtitles,
    undo,
    redo,
    canUndo,
    canRedo,
  };
};
