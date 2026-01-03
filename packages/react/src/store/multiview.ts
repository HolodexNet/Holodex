import {
  decodeLayout,
  generateContentId,
  GRID_DIMENSIONS,
} from "@/lib/multiview-layout";
import { atom, type PrimitiveAtom } from "jotai";
import { atomWithStorage } from "jotai/utils";

// ============================================================================
// Types
// ============================================================================

export type CellType = "video" | "chat" | "empty";

/**
 * Cell visibility state:
 * - visible: Cell is rendered with w>0, h>0
 * - hidden: Cell is in queue but not rendered (w=0, h=0 equivalent)
 */
export type CellVisibility = "visible" | "hidden";

/**
 * Aspect class determines grid dimensions:
 * - horizontal: 12 rows x 20 columns (wide monitors)
 * - square: 12 rows x 12 columns (1:1)
 * - vertical: 20 rows x 12 columns (portrait/mobile)
 */
export type AspectClass = "horizontal" | "square" | "vertical";

/**
 * Cell is the mutable state for a single cell.
 * Each cell in the queue holds an atom<Cell>.
 */
export interface Cell {
  /** Unique identifier for this cell (8-char base64) */
  id: string;
  /** Grid column start (0-indexed) */
  x: number;
  /** Grid row start (0-indexed) */
  y: number;
  /** Width in grid units */
  w: number;
  /** Height in grid units */
  h: number;
  /** Content type */
  type: CellType;
  /** Video ID if type is 'video' */
  videoId?: string;
  /** For chat cells: which video index to show chat for */
  chatTab?: number;
  /** Visibility state, once hidden it is effectively deleted */
  visibility: CellVisibility;
}

/**
 * A cell entry in the queue - wraps the cell state atom with its ID for lookup.
 */
export interface CellEntry {
  /** Stable identifier matching the Cell.id */
  id: string;
  /** The atom containing the mutable cell state */
  atom: PrimitiveAtom<Cell>;
}

/**
 * Maps video IDs to their cell indices in the queue.
 * This allows O(1) lookup of cells by video ID.
 */
export interface ContentMapping {
  [videoId: string]: {
    /** Index in cellQueueAtom where the video cell lives */
    videoCellIndex: number;
    /** Index in cellQueueAtom where the associated chat cell lives (if any) */
    chatCellIndex?: number;
  };
}

export interface LayoutPreset {
  /** Encoded layout string */
  layout: string;
  /** Human-readable name */
  name: string;
  /** Default for this video count */
  default?: number;
}

// ============================================================================
// Core State Atoms
// ============================================================================

/**
 * Helper: Create a CellEntry from a Cell state.
 */
export function createCellEntry(cell: Cell): CellEntry {
  return {
    id: cell.id,
    atom: atom(cell),
  };
}

/**
 * Append-only queue of cell entries. Each entry contains an atom<Cell>.
 * Cells are marked visibility='hidden' rather than removed to preserve iframe DOM order.
 *
 * This is the source of truth for all cells. Each CellEntry wraps a PrimitiveAtom
 * that can be independently subscribed to, allowing granular re-renders.
 */
export const cellQueueAtom = atom<CellEntry[]>([]);

/**
 * Writable atom to apply a layout preset to the current cellQueue.
 *
 * Write: Pass a layout string (from LayoutPreset.layout)
 * Effect: Decodes the preset, matches existing videos to new slots, creates new CellEntry array
 *
 * This is the core "coerce cellQueue to match LayoutPreset" operation.
 */
export const applyLayoutAtom = atom(
  null, // read returns null (write-only)
  (get, set, layoutString: string) => {
    // Import decodeLayout dynamically to avoid circular deps
    // (multiview-utils imports from this file)
    const decoded = decodeLayout(layoutString);

    const currentQueue = get(cellQueueAtom);

    // Gather existing video cells in order (these have content we want to preserve)
    const existingVideoCells: Cell[] = [];
    for (const entry of currentQueue) {
      const state = get(entry.atom);
      if (
        state.visibility === "visible" &&
        state.type === "video" &&
        state.videoId
      ) {
        existingVideoCells.push(state);
      }
    }

    // Separate preset slots by type
    const videoSlots = decoded.cells.filter(
      (c) => c.type === "empty" || c.type === "video",
    );
    const chatSlots = decoded.cells.filter((c) => c.type === "chat");

    const newEntries: CellEntry[] = [];

    // Assign existing videos to new video slot positions
    let videoIndex = 0;
    for (const slot of videoSlots) {
      if (videoIndex < existingVideoCells.length) {
        // Existing video → new position (preserve ID and videoId)
        const existingVideo = existingVideoCells[videoIndex];
        newEntries.push(
          createCellEntry({
            ...existingVideo,
            x: slot.x,
            y: slot.y,
            w: slot.w,
            h: slot.h,
            visibility: "visible",
          }),
        );
        videoIndex++;
      } else {
        // No more existing videos → create empty slot
        newEntries.push(
          createCellEntry({
            ...slot,
            type: "empty",
            videoId: undefined,
            visibility: "visible",
          }),
        );
      }
    }

    // Add chat slots (keep preset positions and chatTab)
    for (const chatSlot of chatSlots) {
      newEntries.push(
        createCellEntry({
          ...chatSlot,
          visibility: "visible",
        }),
      );
    }

    set(cellQueueAtom, newEntries);
    set(autoLayoutDisabledAtom, false); // Reset since we just applied a preset
  },
);

// ============================================================================
// Cell Mutator Atoms
// ============================================================================

/**
 * Fill a specific cell with a video.
 * Write: { cellId: string, videoId: string }
 */
export const fillCellAtom = atom(
  null,
  (get, set, { cellId, videoId }: { cellId: string; videoId: string }) => {
    const currentQueue = get(cellQueueAtom);

    const updatedQueue = currentQueue.map((entry) => {
      if (entry.id === cellId) {
        const currentState = get(entry.atom);
        return createCellEntry({
          ...currentState,
          type: "video" as const,
          videoId,
        });
      }
      return entry;
    });

    set(cellQueueAtom, updatedQueue);
  },
);

/**
 * Clear a cell's content (convert to empty).
 * Write: cellId string
 */
export const clearCellAtom = atom(null, (get, set, cellId: string) => {
  const currentQueue = get(cellQueueAtom);

  const updatedQueue = currentQueue.map((entry) => {
    if (entry.id === cellId) {
      const currentState = get(entry.atom);
      return createCellEntry({
        ...currentState,
        type: "empty" as const,
        videoId: undefined,
        chatTab: undefined,
      });
    }
    return entry;
  });

  set(cellQueueAtom, updatedQueue);
});

/**
 * Hide a cell (mark visibility='hidden').
 * Write: cellId string
 */
export const hideCellAtom = atom(null, (get, set, cellId: string) => {
  const currentQueue = get(cellQueueAtom);

  const updatedQueue = currentQueue.map((entry) => {
    if (entry.id === cellId) {
      const currentState = get(entry.atom);
      return createCellEntry({
        ...currentState,
        visibility: "hidden" as const,
      });
    }
    return entry;
  });

  set(cellQueueAtom, updatedQueue);
});

/**
 * Refresh a cell by regenerating its ID.
 * This forces a new iframe/player instance while keeping content and position.
 * Write: cellId string
 */
export const refreshCellAtom = atom(null, (get, set, cellId: string) => {
  const currentQueue = get(cellQueueAtom);

  const updatedQueue = currentQueue.map((entry) => {
    if (entry.id === cellId) {
      const currentState = get(entry.atom);
      // Create new entry with fresh ID - this destroys the old iframe
      return createCellEntry({
        ...currentState,
        id: generateContentId(),
      });
    }
    return entry;
  });

  set(cellQueueAtom, updatedQueue);
});

/**
 * Convert a cell to a chat cell.
 * Hides the current cell and creates a new chat cell at the same position.
 * The chat tab is set to the first video that doesn't already have a chat cell.
 * Write: cellId string
 */
export const convertToChatAtom = atom(null, (get, set, cellId: string) => {
  const currentQueue = get(cellQueueAtom);

  // Find the cell to convert
  const targetEntry = currentQueue.find((entry) => entry.id === cellId);
  if (!targetEntry) return;

  const targetState = get(targetEntry.atom);

  // Gather all visible video cells (excluding the one being converted)
  const videoCells: { index: number; cell: Cell }[] = [];
  currentQueue.forEach((entry, idx) => {
    const state = get(entry.atom);
    if (
      state.visibility === "visible" &&
      state.type === "video" &&
      state.videoId &&
      entry.id !== cellId
    ) {
      videoCells.push({ index: idx, cell: state });
    }
  });

  // Find which video tabs already have chat cells
  const existingChatTabs = new Set<number>();
  currentQueue.forEach((entry) => {
    const state = get(entry.atom);
    if (
      state.visibility === "visible" &&
      state.type === "chat" &&
      state.chatTab !== undefined
    ) {
      existingChatTabs.add(state.chatTab);
    }
  });

  // Find first video index without an existing chat
  let chatTabTarget = 0;
  for (let i = 0; i < videoCells.length; i++) {
    if (!existingChatTabs.has(i)) {
      chatTabTarget = i;
      break;
    }
  }

  // Hide the original cell and add a new chat cell at the same position
  const updatedQueue = currentQueue.map((entry) => {
    if (entry.id === cellId) {
      return createCellEntry({
        ...targetState,
        visibility: "hidden" as const,
      });
    }
    return entry;
  });

  const newChatCell: Cell = {
    id: generateContentId(),
    x: targetState.x,
    y: targetState.y,
    w: targetState.w,
    h: targetState.h,
    type: "chat",
    chatTab: chatTabTarget,
    visibility: "visible",
  };

  set(cellQueueAtom, [...updatedQueue, createCellEntry(newChatCell)]);
  set(autoLayoutDisabledAtom, true); // Manual edit
});

/**
 * Add a new empty cell at specified position.
 * Write: { x, y, w, h }
 */
export const addEmptyCellAtom = atom(
  null,
  (
    get,
    set,
    { x, y, w, h }: { x: number; y: number; w: number; h: number },
  ) => {
    const currentQueue = get(cellQueueAtom);
    const newCell: Cell = {
      id: generateContentId(),
      x,
      y,
      w,
      h,
      type: "empty",
      visibility: "visible",
    };

    set(cellQueueAtom, [...currentQueue, createCellEntry(newCell)]);
    set(autoLayoutDisabledAtom, true); // Manual edit
  },
);

/**
 * Clear all cells (reset to empty queue).
 */
export const clearAllCellsAtom = atom(null, (get, set) => {
  set(cellQueueAtom, []);
  set(autoLayoutDisabledAtom, false);
});

/**
 * Update cell positions from react-grid-layout Layout.
 * Write: Array of { i: string, x: number, y: number, w: number, h: number }
 */
export const updateLayoutAtom = atom(
  null,
  (
    get,
    set,
    layoutItems: readonly {
      i: string;
      x: number;
      y: number;
      w: number;
      h: number;
    }[],
  ) => {
    const currentQueue = get(cellQueueAtom);
    const layoutMap = new Map(layoutItems.map((item) => [item.i, item]));

    const updatedQueue = currentQueue.map((entry) => {
      const currentState = get(entry.atom);
      const layoutItem = layoutMap.get(entry.id);

      if (layoutItem && currentState.visibility === "visible") {
        // Only update if position actually changed
        if (
          currentState.x !== layoutItem.x ||
          currentState.y !== layoutItem.y ||
          currentState.w !== layoutItem.w ||
          currentState.h !== layoutItem.h
        ) {
          return createCellEntry({
            ...currentState,
            x: layoutItem.x,
            y: layoutItem.y,
            w: layoutItem.w,
            h: layoutItem.h,
          });
        }
      }
      return entry;
    });

    set(cellQueueAtom, updatedQueue);
  },
);

/**
 * Derived atom: Maps video IDs to their cell indices for O(1) lookup.
 * Automatically recomputes when cellQueueAtom changes.
 * Might be used in the future? not used atm.
 */
// export const contentMapAtom = atom<ContentMapping>((get) => {
//   const queue = get(cellQueueAtom);
//   const map: ContentMapping = {};

//   queue.forEach((entry, index) => {
//     const state = get(entry.atom);
//     if (state.visibility !== "visible") return;

//     if (state.type === "video" && state.videoId) {
//       if (!map[state.videoId]) {
//         map[state.videoId] = { videoCellIndex: index };
//       } else {
//         map[state.videoId].videoCellIndex = index;
//       }
//     } else if (state.type === "chat" && state.chatTab !== undefined) {
//       // Find the video at this chat tab index and link them
//       const videoEntries = queue.filter((e, i) => {
//         const s = get(e.atom);
//         return s.visibility === "visible" && s.type === "video" && s.videoId;
//       });
//       const targetVideo = videoEntries[state.chatTab];
//       if (targetVideo) {
//         const targetState = get(targetVideo.atom);
//         if (targetState.videoId) {
//           if (!map[targetState.videoId]) {
//             map[targetState.videoId] = {
//               videoCellIndex: queue.indexOf(targetVideo),
//             };
//           }
//           map[targetState.videoId].chatCellIndex = index;
//         }
//       }
//     }
//   });

//   return map;
// });

/**
 * Current aspect class based on viewport dimensions.
 */
export const aspectClassAtom = atom<AspectClass>("horizontal");

/**
 * Global edit mode toggle.
 */
export const editModeAtom = atom(false);

/**
 * Sync toolbar visibility toggle.
 */
export const syncToolbarOpenAtom = atom(false);

/**
 * Whether the user has made manual edits (disables auto-layout).
 */
export const autoLayoutDisabledAtom = atom(false);

// ============================================================================
// Persisted State (localStorage)
// ============================================================================

/**
 * User-customized presets per aspect class. TODO: The initial value should come from multiview-utils.ts
 */
export const userPresetsAtom = atomWithStorage<
  Record<AspectClass, LayoutPreset[]>
>("mv-user-presets", {
  horizontal: [],
  square: [],
  vertical: [],
});

// ============================================================================
// Derived Atoms
// ============================================================================

/**
 * Visible cell entries only (visibility === 'visible').
 */
export const visibleCellEntriesAtom = atom((get) => {
  const queue = get(cellQueueAtom);
  return queue.filter((entry) => {
    const state = get(entry.atom);
    return state.visibility === "visible";
  });
});

/**
 * Visible cell states (materialized from atoms).
 * Use this when you need the actual state values, not just entries.
 */
export const visibleCellsAtom = atom((get) => {
  const entries = get(visibleCellEntriesAtom);
  return entries.map((entry) => get(entry.atom));
});

/**
 * Active video cells (visible, type=video, has videoId).
 */
export const activeVideosAtom = atom((get) => {
  const states = get(visibleCellsAtom);
  return states.filter((cell) => cell.type === "video" && cell.videoId);
});

/**
 * Count of non-chat visible cells (for layout selection).
 */
export const nonChatCellCountAtom = atom((get) => {
  const states = get(visibleCellsAtom);
  return states.filter((cell) => cell.type !== "chat").length;
});

/**
 * Current grid dimensions based on aspect class.
 */
export const gridDimensionsAtom = atom((get) => {
  const aspectClass = get(aspectClassAtom);
  return GRID_DIMENSIONS[aspectClass];
});

// ============================================================================
// Multiview Playback Control
// ============================================================================

/**
 * Shared volume level for all multiview videos (0-100).
 */
export const multiviewVolumeAtom = atom(80);

/**
 * Whether all videos should be muted.
 */
export const multiviewMutedAtom = atom(false);
