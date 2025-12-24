import { atom } from "jotai";
import { atomWithStorage } from "jotai/utils";

// ============================================================================
// Types
// ============================================================================

export type CellType = "video" | "chat" | "empty";

/**
 * Aspect class determines grid dimensions:
 * - horizontal: 12 rows x 20 columns (wide monitors)
 * - square: 12 rows x 12 columns (1:1)
 * - vertical: 20 rows x 12 columns (portrait/mobile)
 */
export type AspectClass = "horizontal" | "square" | "vertical";

export const GRID_DIMENSIONS: Record<
  AspectClass,
  { rows: number; cols: number }
> = {
  horizontal: { rows: 12, cols: 20 },
  square: { rows: 12, cols: 12 },
  vertical: { rows: 20, cols: 12 },
};

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
  /** Video ID if type is 'video' or related chat */
  videoId?: string;
  /** For chat cells: which video index to show chat for */
  chatTab?: number;
}

/**
 * Maps video IDs to their cell indices in the queue.
 * This allows O(1) lookup of cells by video ID.
 */
export interface ContentMapping {
  [videoId: string]: {
    videoCellIndex: number;
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
 * Append-only queue of all cells.
 * Cells are hidden (w=0, h=0) rather than removed to preserve iframe DOM order.
 * Only valid cells are persisted to storage.
 */
export const cellQueueAtom = atom<Cell[]>([]);

/**
 * Maps video IDs to their cell indices for O(1) lookup.
 */
export const contentMapAtom = atom<ContentMapping>({});

/**
 * Current aspect class based on viewport dimensions.
 */
export const aspectClassAtom = atom<AspectClass>("horizontal");

/**
 * Global edit mode toggle.
 */
export const editModeAtom = atom(false);

/**
 * Whether the user has made manual edits (disables auto-layout).
 */
export const autoLayoutDisabledAtom = atom(false);

// ============================================================================
// Persisted State (localStorage)
// ============================================================================

/**
 * User-customized presets per aspect class.
 */
export const userPresetsAtom = atomWithStorage<
  Record<AspectClass, LayoutPreset[]>
>("mv-user-presets", {
  horizontal: [],
  square: [],
  vertical: [],
});

/**
 * Persisted layout state (only valid cells saved).
 */
export const persistedLayoutAtom = atomWithStorage<{
  cells: Cell[];
  aspectClass: AspectClass;
} | null>("mv-persisted-layout", null);

// ============================================================================
// Derived Atoms
// ============================================================================

/**
 * Active (visible) cells only.
 */
export const activeCellsAtom = atom((get) => {
  const cells = get(cellQueueAtom);
  return cells.filter((cell) => cell.w > 0 && cell.h > 0);
});

/**
 * Active video cells (non-chat, non-empty).
 */
export const activeVideosAtom = atom((get) => {
  const cells = get(activeCellsAtom);
  return cells.filter((cell) => cell.type === "video" && cell.videoId);
});

/**
 * Count of non-chat cells (for layout selection).
 */
export const nonChatCellCountAtom = atom((get) => {
  const cells = get(activeCellsAtom);
  return cells.filter((cell) => cell.type !== "chat").length;
});

/**
 * Current grid dimensions based on aspect class.
 */
export const gridDimensionsAtom = atom((get) => {
  const aspectClass = get(aspectClassAtom);
  return GRID_DIMENSIONS[aspectClass];
});
