import { PrimitiveAtom, atom, useAtom } from "jotai";
import IntervalTree from "@flatten-js/interval-tree";
import { useCallback } from "react";
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

type UndoAction = {
  type: "delete" | "create" | "edit";
  id: string;
  oldData?: ParsedScripterMessage; // For edit and delete actions
};

const MAX_UNDO_ACTIONS = 100;

export const subtitleAtomsMap = new Map<
  string,
  PrimitiveAtom<ParsedScripterMessage>
>();

const intervalTreeAtom = atom(() => new IntervalTree<string>());

const undoQueueAtom = atom<UndoAction[]>([]);

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
  | { type: "DELETE_SUBTITLE"; payload: string }
  | { type: "UNDO" };

export const subtitleManagerAtom = atom(
  (get) => ({
    intervalTree: get(intervalTreeAtom),
    undoQueue: get(undoQueueAtom),
  }),
  (get, set, action: SubtitleManagerAction) => {
    const intervalTree = get(intervalTreeAtom);
    const undoQueue = get(undoQueueAtom);

    const pushUndoAction = (action: UndoAction) => {
      set(undoQueueAtom, (prev) => {
        const newQueue = [action, ...prev.slice(0, MAX_UNDO_ACTIONS - 1)];
        return newQueue;
      });
    };

    switch (action.type) {
      case "ADD_SUBTITLES": {
        const subtitles: ParsedScripterMessage[] = action.payload;
        subtitles.forEach((subtitle) => {
          const subtitleAtom = atom(structuredClone(subtitle));
          subtitleAtomsMap.set(subtitle.id, subtitleAtom);
          updateIntervalTree(intervalTree, subtitle.id, null, [
            subtitle.video_offset,
            subtitle.end,
          ]);
        });
        // Bulk actions are not undoable, so we don't push to undoQueue
        break;
      }
      case "ADD_SUBTITLE": {
        const newSubtitle: ParsedScripterMessage = action.payload;
        const subtitleAtom = atom(structuredClone(newSubtitle));
        subtitleAtomsMap.set(newSubtitle.id, subtitleAtom);
        updateIntervalTree(intervalTree, newSubtitle.id, null, [
          newSubtitle.video_offset,
          newSubtitle.end,
        ]);
        pushUndoAction({ type: "create", id: newSubtitle.id });
        break;
      }
      case "UPDATE_SUBTITLE": {
        const updatedSubtitle: ParsedScripterMessage = action.payload;
        const subtitleAtom = subtitleAtomsMap.get(updatedSubtitle.id);
        if (subtitleAtom) {
          const oldSubtitle = get(subtitleAtom);
          pushUndoAction({
            type: "edit",
            id: updatedSubtitle.id,
            oldData: oldSubtitle,
          });
          set(subtitleAtom, structuredClone(updatedSubtitle));
          updateIntervalTree(
            intervalTree,
            updatedSubtitle.id,
            [oldSubtitle.video_offset, oldSubtitle.end],
            [updatedSubtitle.video_offset, updatedSubtitle.end],
          );
        }
        break;
      }
      case "DELETE_SUBTITLE": {
        const subtitleId: string = action.payload;
        const subtitleAtom = subtitleAtomsMap.get(subtitleId);
        if (subtitleAtom) {
          const subtitleToDelete = get(subtitleAtom);
          pushUndoAction({
            type: "delete",
            id: subtitleId,
            oldData: subtitleToDelete,
          });
          intervalTree.remove(
            [subtitleToDelete.video_offset, subtitleToDelete.end],
            subtitleId,
          );
          subtitleAtomsMap.delete(subtitleId);
        }
        break;
      }
      case "UNDO": {
        const lastAction = undoQueue[0];
        if (lastAction) {
          set(undoQueueAtom, (prev) => prev.slice(1));
          switch (lastAction.type) {
            case "create":
              {
                const subtitleAtom = subtitleAtomsMap.get(lastAction.id);
                if (subtitleAtom) {
                  const subtitle = get(subtitleAtom);
                  intervalTree.remove(
                    [subtitle.video_offset, subtitle.end],
                    lastAction.id,
                  );
                  subtitleAtomsMap.delete(lastAction.id);
                }
              }
              break;
            case "delete":
              if (lastAction.oldData) {
                const subtitleAtom = atom(structuredClone(lastAction.oldData));
                subtitleAtomsMap.set(lastAction.id, subtitleAtom);
                updateIntervalTree(intervalTree, lastAction.id, null, [
                  lastAction.oldData.video_offset,
                  lastAction.oldData.end,
                ]);
              }
              break;
            case "edit":
              if (lastAction.oldData) {
                const subtitleAtom = subtitleAtomsMap.get(lastAction.id);
                if (subtitleAtom) {
                  const currentSubtitle = get(subtitleAtom);
                  set(subtitleAtom, structuredClone(lastAction.oldData));
                  updateIntervalTree(
                    intervalTree,
                    lastAction.id,
                    [currentSubtitle.video_offset, currentSubtitle.end],
                    [lastAction.oldData.video_offset, lastAction.oldData.end],
                  );
                }
              }
              break;
          }
        }
        break;
      }
    }
  },
);

export const useSubtitleManager = () => {
  const [{ intervalTree }, dispatch] = useAtom(subtitleManagerAtom);

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

  const getAllSubtitles = useCallback(() => {
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
    getAllSubtitles,
  };
};
