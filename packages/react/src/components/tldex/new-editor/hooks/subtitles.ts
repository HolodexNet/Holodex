import { atom, useAtomValue, useSetAtom } from "jotai";
import { FetchClient } from "@/lib/fetch";
import { toParsedMessage } from "@/lib/socket";

export async function getSubtitlesForVideo(
  apiClient: FetchClient,
  video: string,
  lang: string,
) {
  const response = await apiClient.get<TLDexMessage[]>(
    `/api/v2/videos/${video}/chats`,
    {
      params: {
        lang,
        verified: 0,
        moderator: 0,
        vtuber: 0,
        limit: 100000,
        mode: 1,
      },
    },
  );
  return response.map(
    (msg) => toParsedMessage(msg, video) as unknown as ParsedScripterMessage,
  );
}

type UndoAction = {
  type: "delete" | "create" | "edit";
  id: string;
  oldData?: ParsedScripterMessage;
};

const MAX_UNDO_ACTIONS = 100;

export const subtitlesAtom = atom<ParsedScripterMessage[]>([]);
const undoQueueAtom = atom<UndoAction[]>([]);

export type SubtitleAction =
  | { type: "SET_SUBTITLES"; payload: ParsedScripterMessage[] }
  | { type: "ADD_SUBTITLE"; payload: ParsedScripterMessage }
  | { type: "UPDATE_SUBTITLE"; payload: ParsedScripterMessage }
  | { type: "DELETE_SUBTITLE"; payload: string }
  | { type: "UNDO" };

export const subtitleManagerAtom = atom(
  (get) => ({
    subtitles: get(subtitlesAtom),
    undoQueue: get(undoQueueAtom),
  }),
  (get, set, action: SubtitleAction) => {
    // const subtitles = get(subtitlesAtom);
    const undoQueue = get(undoQueueAtom);

    const pushUndo = (action: UndoAction) => {
      set(undoQueueAtom, (prev) => {
        if (prev[0]?.type === action.type && prev[0]?.id === action.id)
          return prev;
        return [action, ...prev.slice(0, MAX_UNDO_ACTIONS - 1)];
      });
    };

    switch (action.type) {
      case "SET_SUBTITLES": {
        set(
          subtitlesAtom,
          action.payload.sort((a, b) => a.video_offset - b.video_offset),
        );
        break;
      }

      case "ADD_SUBTITLE": {
        const newSubtitle = action.payload;
        pushUndo({ type: "create", id: newSubtitle.id });
        set(subtitlesAtom, (prev) =>
          [...prev, newSubtitle].sort(
            (a, b) => a.video_offset - b.video_offset,
          ),
        );
        break;
      }

      case "UPDATE_SUBTITLE": {
        const updated = action.payload;
        set(subtitlesAtom, (prev) => {
          const index = prev.findIndex((s) => s.id === updated.id);
          if (index === -1) return prev;

          pushUndo({ type: "edit", id: updated.id, oldData: prev[index] });
          const newList = [...prev];
          newList[index] = updated;
          return newList.sort((a, b) => a.video_offset - b.video_offset);
        });
        break;
      }

      case "DELETE_SUBTITLE": {
        const id = action.payload;
        set(subtitlesAtom, (prev) => {
          const index = prev.findIndex((s) => s.id === id);
          if (index === -1) return prev;

          pushUndo({ type: "delete", id, oldData: prev[index] });
          return prev.filter((s) => s.id !== id);
        });
        break;
      }

      case "UNDO": {
        const lastAction = undoQueue[0];
        if (!lastAction) return;

        set(undoQueueAtom, (prev) => prev.slice(1));
        set(subtitlesAtom, (prev) => {
          let index, newList;
          switch (lastAction.type) {
            case "create":
              return prev.filter((s) => s.id !== lastAction.id);

            case "delete":
              return lastAction.oldData
                ? [...prev, lastAction.oldData].sort(
                    (a, b) => a.video_offset - b.video_offset,
                  )
                : prev;

            case "edit":
              if (!lastAction.oldData) return prev;
              index = prev.findIndex((s) => s.id === lastAction.id);
              if (index === -1) return prev;

              newList = [...prev];
              newList[index] = lastAction.oldData;
              return newList.sort((a, b) => a.video_offset - b.video_offset);

            default:
              return prev;
          }
        });
        break;
      }
    }
  },
);

export const undoActionAtom = atom(
  (get) => get(undoQueueAtom).length > 0,
  (_, set) => set(subtitleManagerAtom, { type: "UNDO" }),
);

export function useSubtitle(id: string) {
  const subtitles = useAtomValue(subtitlesAtom);
  const edit = useSetAtom(subtitleManagerAtom);
  const subtitle = subtitles.find((s) => s.id === id);
  return [subtitle, edit] as const;
}

export function getSubtitlesInRange(
  subtitles: ParsedScripterMessage[],
  start: number,
  end: number,
) {
  return subtitles.filter((s) => !(s.end < start || s.video_offset > end));
}
