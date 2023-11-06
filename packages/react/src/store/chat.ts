import { atom } from "jotai";
import { atomFamily, atomWithReducer } from "jotai/utils";

interface RoomState {
  /** whether or not a room has finished loading all archived chat content*/
  completed: boolean;
  /**whether or not a room is currently loading some content */
  loading: boolean;
}

interface RoomInfo {
  messages: ParsedMessage[];
  /** Tracks the loading state of history */
  state: RoomState;
  /** playhead location */
  elapsed: number;
  /** absolute second epoch of video player @ location, only available if video contains start_at */
  absolute?: number;
}

export const roomsAtom = atomFamily(() =>
  atom<RoomInfo>({
    messages: [],
    state: { completed: false, loading: false },
    elapsed: 0,
    absolute: 0,
  }),
);

export const videoToRoomAtom = atomFamily(() =>
  atomWithReducer<
    Set<RoomIDString>,
    | { type: "add" | "del"; value: RoomIDString }
    | { type: "clear"; value?: never }
  >(new Set(), (prev, action) => {
    switch (action?.type) {
      case "add":
        return prev.add(action.value);
      case "del":
        prev.delete(action.value);
        break;
      case "clear":
        prev.clear();
        break;
      default:
        break;
    }
    return prev;
  }),
);
