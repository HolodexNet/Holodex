import { atom } from "jotai/vanilla";
import type { PrimitiveAtom } from "jotai/vanilla";
import type { Atom } from "jotai/vanilla";

/**
 * @param targetAtom an atom or derived atom
 * @param limit the maximum number of history states to keep
 * @returns an atom with an array of history states
 */
export function atomWithHistory<T>(targetAtom: Atom<T>, limit: number) {
  const refAtom = atom(
    () => ({ history: [] as T[] }),
    (get, _set) => () => void (get(refAtom).history.length = 0),
  );
  refAtom.onMount = (mount) => mount();
  refAtom.debugPrivate = true;
  return atom((get) => {
    const ref = get(refAtom);
    return (ref.history = [get(targetAtom), ...ref.history].slice(0, limit));
  });
}

type Undoable = {
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
};

/**
 * @param targetAtom a primitive atom or equivalent
 * @param limit the maximum number of history states to keep
 * @returns an atom with undo/redo functionality
 */
export function atomWithUndo<T>(targetAtom: PrimitiveAtom<T>, limit: number) {
  const historyAtom = atomWithHistory(targetAtom, limit);
  const UNDO = Symbol("undo");
  const REDO = Symbol("redo");
  type DoAction = typeof UNDO | typeof REDO;
  const createRef = () => ({
    index: 0,
    stack: [] as T[],
    action: null as DoAction | null,
  });
  const refreshAtom = atom(0);
  const refAtom = atom(createRef, (get, set) => {
    void Object.assign(get(refAtom), createRef());
    set(refreshAtom, (c) => c + 1);
  });
  refAtom.onMount = (unmount) => unmount;
  refAtom.debugPrivate = true;
  const updateRefAtom = atom(
    (get) => {
      const history = get(historyAtom);
      const ref = get(refAtom);
      get(refreshAtom);
      if (ref.action) {
        // recalculation caused by undo/redo
        ref.action = null;
      } else {
        // Remove future states if any
        ref.stack = ref.stack.slice(0, ref.index + 1);
        // Push the current state to the history
        ref.stack.push(history[0] as T);
        // Limit the history
        ref.stack = ref.stack.slice(-limit);
        // Move the current index to the end
        ref.index = ref.stack.length - 1;
      }
      return { ...ref };
    },
    (get) => {
      const ref = get(refAtom);
      ref.stack = [get(targetAtom)];
      return () => {
        ref.index = 0;
        ref.stack.length = 0;
      };
    },
  );
  updateRefAtom.onMount = (mount) => mount();
  updateRefAtom.debugPrivate = true;
  const canUndoAtom = atom((get) => {
    return get(updateRefAtom).index > 0;
  });
  const canRedoAtom = atom((get) => {
    const ref = get(updateRefAtom);
    return ref.index < ref.stack.length - 1;
  });
  const baseAtom = atom<Undoable, [DoAction], void>(
    (get, { setSelf }) => ({
      undo: () => setSelf(UNDO),
      redo: () => setSelf(REDO),
      canUndo: get(canUndoAtom),
      canRedo: get(canRedoAtom),
    }),
    (get, set, update) => {
      const ref = get(refAtom);
      const setCurrentState = () => {
        const value = ref.stack[ref.index];
        if (value === undefined) return;
        set(targetAtom, value as T);
      };
      if (update === UNDO) {
        if (get(baseAtom).canUndo) {
          ref.index--;
          ref.action = UNDO;
          setCurrentState();
        }
        return;
      }
      if (update === REDO) {
        if (get(baseAtom).canRedo) {
          ref.index++;
          ref.action = REDO;
          setCurrentState();
        }
        return;
      }
    },
  );
  baseAtom.debugPrivate = true;
  return atom((get) => get(baseAtom));
}
