import { atom } from "jotai";
import { atomFamily, atomWithReducer } from "jotai/utils";

export const subscribedRoomsAtom = atomWithReducer<
  Set<string>,
  { type: "add" | "del"; value: string } | { type: "clear"; value?: never }
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
});

export const roomReferenceCounterAtom = atomFamily((roomId) => atom<number>(0));

export const videoStateAtom = atom(new Map());
