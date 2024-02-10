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

const initialState: ParsedMessage[] = []; // Initial state can be an empty array or loaded from somewhere

export const subtitlesAtom = atom(initialState);
export const subtitleAtomsAtom = splitAtom(subtitlesAtom);

export const useSubtitles = () => {
  const [_, setList] = useAtom(subtitlesAtom);
  const [subtitles, dispatch] = useAtom(subtitleAtomsAtom);

  const addSubtitle = (subtitle: ParsedMessage) => {
    setList((oldSubtitles) => {
      add(oldSubtitles, subtitle, ParsedMessageOFFSETComparator);
      return oldSubtitles;
    });
  };

  const setSubtitles = (newSubtitles: ParsedMessage[]) => {
    setList(newSubtitles.sort(ParsedMessageOFFSETComparator));
  };

  const deleteSubtitle = (subtitleAtom: PrimitiveAtom<ParsedMessage>) =>
    dispatch({ type: "remove", atom: subtitleAtom });

  // const removeSubtitle = (index: number) => {
  //   setSubtitles((oldSubtitles) => oldSubtitles.filter((_, i) => i !== index));
  // };

  const clearSubtitles = () => {
    setList([]);
  };

  return {
    subtitles,
    setSubtitles,
    addSubtitle,
    deleteSubtitle,
    // removeSubtitle,
    clearSubtitles,
  };
};

// I'm not sure how useful this construct is
// export const useSubtitleItem = (subtitleAtom: PrimitiveAtom<ParsedMessage>) => {
//   const [subtitle, setSubtitle] = useAtom(subtitleAtom);
//   const [list, dispatch] = useAtom(subtitleAtomsAtom);

//   const updateSubtitle = (
//     newDetails: ParsedMessage | ((prev: ParsedMessage) => ParsedMessage),
//   ) => {
//     setSubtitle(newDetails);
//   };

//   const deleteSubtitle = () => dispatch({ type: "remove", atom: subtitleAtom });

//   // Potentially add select/deselect logic here or handle it separately based on the application's needs

//   return { subtitle, updateSubtitle, deleteSubtitle };
// };
