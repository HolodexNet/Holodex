import { PrimitiveAtom, atom, useAtom } from "jotai";
import IntervalTree from "@flatten-js/interval-tree";
import { useCallback, useMemo } from "react";
import { FetchClient } from "@/lib/fetch";
import { toParsedMessage } from "@/lib/socket";
export async function getSubtitlesForVideo(
  apiClient: FetchClient,
  video: string,
  lang: string,
) {
  return (
    await apiClient.get<TLDexMessage[]>(`/api/v2/videos/${video}/chats`, {
      params: {
        lang,
        verified: 0,
        moderator: 0,
        vtuber: 0,
        limit: 100000,
        mode: 1, // TL Client Mode.
      },
    })
  ).map((message) => toParsedMessage(message, video) as ParsedScripterMessage);
}

// WeakMap to store subtitle atoms
const subtitleAtomsMap = new Map<
  string, // identity
  PrimitiveAtom<ParsedScripterMessage>
>();

// Function to get or create an atom for a subtitle
const getSubtitleAtom = (
  subtitle: ParsedScripterMessage,
): PrimitiveAtom<ParsedScripterMessage> => {
  const key = subtitle.id || subtitle.key;
  let subtitleAtom = subtitleAtomsMap.get(key);
  if (!subtitleAtom) {
    subtitleAtom = atom(subtitle);
    subtitleAtomsMap.set(key, subtitleAtom);
  }
  return subtitleAtom;
};

const intervalTreeAtom = atom(() => new IntervalTree<string>());

const updateIntervalTree = (
  tree: IntervalTree<string>,
  id: string,
  oldInterval: [number, number] | null,
  newInterval: [number, number],
) => {
  if (oldInterval) {
    tree.remove(oldInterval, id);
  }
  tree.insert(newInterval, id);
};

export type SubtitleManagerAction =
  | { type: "ADD_SUBTITLES"; payload: ParsedScripterMessage[] }
  | { type: "ADD_SUBTITLE"; payload: ParsedScripterMessage }
  | { type: "UPDATE_SUBTITLE"; payload: ParsedScripterMessage }
  | { type: "DELETE_SUBTITLE"; payload: string };

export const subtitleManagerAtom = atom(
  (get) => get(intervalTreeAtom),
  (get, set, action: SubtitleManagerAction) => {
    const intervalTree = get(intervalTreeAtom);

    switch (action.type) {
      case "ADD_SUBTITLES": {
        const subtitles: ParsedScripterMessage[] = action.payload;
        subtitles.forEach((subtitle) => {
          const subtitleAtom = getSubtitleAtom(subtitle);
          set(subtitleAtom, subtitle);
          updateIntervalTree(intervalTree, subtitle.id || subtitle.key, null, [
            subtitle.video_offset,
            subtitle.end,
          ]);
        });
        break;
      }
      case "ADD_SUBTITLE": {
        const newSubtitle: ParsedScripterMessage = action.payload;
        const subtitleAtom = getSubtitleAtom(newSubtitle);
        set(subtitleAtom, newSubtitle);
        updateIntervalTree(
          intervalTree,
          newSubtitle.id || newSubtitle.key,
          null,
          [newSubtitle.video_offset, newSubtitle.end],
        );
        break;
      }
      case "UPDATE_SUBTITLE": {
        const updatedSubtitle: ParsedScripterMessage = action.payload;
        const subtitleAtom = getSubtitleAtom(updatedSubtitle);
        const oldSubtitle = get(subtitleAtom);
        set(subtitleAtom, updatedSubtitle);
        updateIntervalTree(
          intervalTree,
          updatedSubtitle.id || updatedSubtitle.key,
          [oldSubtitle.video_offset, oldSubtitle.end],
          [updatedSubtitle.video_offset, updatedSubtitle.end],
        );
        break;
      }
      case "DELETE_SUBTITLE": {
        const subtitleId: string = action.payload;
        const key = subtitleId;
        const subtitleAtom = subtitleAtomsMap.get(key);
        if (subtitleAtom) {
          const subtitleToDelete = get(subtitleAtom);
          intervalTree.remove(
            [subtitleToDelete.video_offset, subtitleToDelete.end],
            subtitleId,
          );
          subtitleAtomsMap.delete(key);
        }
        break;
      }
    }
  },
);
export const useSubtitleManager = () => {
  const [intervalTree, dispatch] = useAtom(subtitleManagerAtom);

  const addSubtitle = useCallback(
    (subtitle: Omit<ParsedScripterMessage, "id" | "key">) => {
      const id = Date.now().toString();
      const newSubtitle: ParsedScripterMessage = {
        ...subtitle,
        id,
        key: `subtitle-${id}`,
        end: subtitle.video_offset + (subtitle.duration || 3000) / 1000, // Default duration of 3 seconds if not provided
      };
      dispatch({ type: "ADD_SUBTITLE", payload: newSubtitle });
    },
    [dispatch],
  );

  const updateSubtitle = useCallback(
    (subtitle: ParsedScripterMessage) => {
      const updatedSubtitle: ParsedScripterMessage = {
        ...subtitle,
        end: subtitle.video_offset + (subtitle.duration || 3000) / 1000,
      };
      dispatch({ type: "UPDATE_SUBTITLE", payload: updatedSubtitle });
    },
    [dispatch],
  );

  const deleteSubtitle = useCallback(
    (id: string) => {
      dispatch({ type: "DELETE_SUBTITLE", payload: id });
    },
    [dispatch],
  );

  const getSubtitlesInRange = useCallback(
    (start: number, end: number): PrimitiveAtom<ParsedScripterMessage>[] => {
      const ids = intervalTree.search([start, end]);
      return ids
        .map((id) => {
          const subtitleAtom = subtitleAtomsMap.get(id);
          return subtitleAtom;
        })
        .filter((x): x is PrimitiveAtom<ParsedScripterMessage> => !!x);
    },
    [intervalTree],
  );

  const allSubtitles = useMemo(() => {
    return intervalTree.items
      .map(({ value: id }) => subtitleAtomsMap.get(id))
      .filter(
        (subtitle): subtitle is PrimitiveAtom<ParsedScripterMessage> =>
          subtitle !== null,
      );
  }, [intervalTree]);

  return {
    addSubtitle,
    updateSubtitle,
    deleteSubtitle,
    getSubtitlesInRange,
    allSubtitles,
  };
};
