import type { AspectClass, Cell, LayoutPreset } from "@/store/multiview";
import { GRID_DIMENSIONS } from "./multiview-layout";
import { b64, encodeLayout } from "./multiview-layout";

// ============================================================================
// Preset Generation Helpers
// ============================================================================

interface CellDef {
  x: number;
  y: number;
  w: number;
  h: number;
  type?: "video" | "chat";
  chatTab?: number;
}

/**
 * Encode a single cell definition to the compact format.
 */
function encodeCell(cell: CellDef): string {
  let encoded = "";
  encoded += b64[cell.x];
  encoded += b64[cell.y];
  encoded += b64[cell.w];
  encoded += b64[cell.h];
  if (cell.type === "chat") {
    encoded += `chat${cell.chatTab ?? 0}`;
  }
  return encoded;
}

/**
 * Create a preset from human-readable cell definitions.
 * This makes presets self-documenting and easier to maintain.
 */
function createPreset(
  cells: CellDef[],
  name: string,
  defaultCount?: number,
): LayoutPreset {
  const layout = cells.map(encodeCell).join(",");
  return defaultCount !== undefined
    ? { layout, name, default: defaultCount }
    : { layout, name };
}

/**
 * Default presets for horizontal (12 rows x 20 cols) layouts.
 * Grid: 20 columns wide, 12 rows tall
 */
export const horizontalPresets: LayoutPreset[] = [
  // 1 video - full screen
  createPreset([{ x: 0, y: 0, w: 20, h: 12 }], "1🎞️", 1),

  // 1 video with side chat
  createPreset(
    [
      { x: 0, y: 0, w: 15, h: 12 },
      { x: 15, y: 0, w: 5, h: 12, type: "chat", chatTab: 0 },
    ],
    "Side Chat 1",
  ),

  // 2 videos - side by side
  createPreset(
    [
      { x: 0, y: 0, w: 10, h: 12 },
      { x: 10, y: 0, w: 10, h: 12 },
    ],
    "2🎞️",
    2,
  ),

  // 2 videos with side chat
  createPreset(
    [
      { x: 0, y: 0, w: 8, h: 6 },
      { x: 0, y: 6, w: 8, h: 6 },
      { x: 8, y: 0, w: 12, h: 12, type: "chat" },
    ],
    "Side Chat 2",
  ),

  // 1 large + 2 small (picture-in-picture style)
  createPreset(
    [
      { x: 0, y: 0, w: 14, h: 12 },
      { x: 14, y: 0, w: 6, h: 6 },
      { x: 14, y: 6, w: 6, h: 6 },
    ],
    "1🎞️+2",
    3,
  ),

  // 2x2 grid
  createPreset(
    [
      { x: 0, y: 0, w: 10, h: 6 },
      { x: 10, y: 0, w: 10, h: 6 },
      { x: 0, y: 6, w: 10, h: 6 },
      { x: 10, y: 6, w: 10, h: 6 },
    ],
    "2x2🎞️",
    4,
  ),

  // 5 videos - 2 on top, 3 on bottom
  createPreset(
    [
      { x: 0, y: 0, w: 10, h: 6 },
      { x: 10, y: 0, w: 10, h: 6 },
      { x: 0, y: 6, w: 7, h: 6 },
      { x: 7, y: 6, w: 6, h: 6 },
      { x: 13, y: 6, w: 7, h: 6 },
    ],
    "5🎞️",
    5,
  ),

  // 2x3 grid (6 videos)
  createPreset(
    [
      { x: 0, y: 0, w: 7, h: 6 },
      { x: 7, y: 0, w: 6, h: 6 },
      { x: 13, y: 0, w: 7, h: 6 },
      { x: 0, y: 6, w: 7, h: 6 },
      { x: 7, y: 6, w: 6, h: 6 },
      { x: 13, y: 6, w: 7, h: 6 },
    ],
    "2x3🎞️",
    6,
  ),

  // 7 videos - 4 on top, 3 on bottom
  createPreset(
    [
      { x: 0, y: 0, w: 5, h: 6 },
      { x: 5, y: 0, w: 5, h: 6 },
      { x: 10, y: 0, w: 5, h: 6 },
      { x: 15, y: 0, w: 5, h: 6 },
      { x: 0, y: 6, w: 7, h: 6 },
      { x: 7, y: 6, w: 6, h: 6 },
      { x: 13, y: 6, w: 7, h: 6 },
    ],
    "7🎞️",
    7,
  ),

  // 8 videos - 4x2
  createPreset(
    [
      { x: 0, y: 0, w: 5, h: 6 },
      { x: 5, y: 0, w: 5, h: 6 },
      { x: 10, y: 0, w: 5, h: 6 },
      { x: 15, y: 0, w: 5, h: 6 },
      { x: 0, y: 6, w: 5, h: 6 },
      { x: 5, y: 6, w: 5, h: 6 },
      { x: 10, y: 6, w: 5, h: 6 },
      { x: 15, y: 6, w: 5, h: 6 },
    ],
    "4x2🎞️",
    8,
  ),

  // 9 videos - 3x3 (approximate fit within 20x12)
  createPreset(
    [
      { x: 0, y: 0, w: 7, h: 4 },
      { x: 7, y: 0, w: 6, h: 4 },
      { x: 13, y: 0, w: 7, h: 4 },
      { x: 0, y: 4, w: 7, h: 4 },
      { x: 7, y: 4, w: 6, h: 4 },
      { x: 13, y: 4, w: 7, h: 4 },
      { x: 0, y: 8, w: 7, h: 4 },
      { x: 7, y: 8, w: 6, h: 4 },
      { x: 13, y: 8, w: 7, h: 4 },
    ],
    "3x3🎞️",
    9,
  ),
];

/**
 * Default presets for square (12 rows x 12 cols) layouts.
 */
export const squarePresets: LayoutPreset[] = [
  // 1 video - full screen
  createPreset([{ x: 0, y: 0, w: 12, h: 12 }], "1🎞️", 1),

  // 2 videos - side by side
  createPreset(
    [
      { x: 0, y: 0, w: 6, h: 12 },
      { x: 6, y: 0, w: 6, h: 12 },
    ],
    "2🎞️ Side",
    2,
  ),

  // 2 videos - stacked
  createPreset(
    [
      { x: 0, y: 0, w: 12, h: 6 },
      { x: 0, y: 6, w: 12, h: 6 },
    ],
    "2🎞️ Stacked",
  ),

  // 2x2 grid
  createPreset(
    [
      { x: 0, y: 0, w: 6, h: 6 },
      { x: 6, y: 0, w: 6, h: 6 },
      { x: 0, y: 6, w: 6, h: 6 },
      { x: 6, y: 6, w: 6, h: 6 },
    ],
    "2x2🎞️",
    4,
  ),

  // 3x3 grid
  createPreset(
    [
      { x: 0, y: 0, w: 4, h: 4 },
      { x: 4, y: 0, w: 4, h: 4 },
      { x: 8, y: 0, w: 4, h: 4 },
      { x: 0, y: 4, w: 4, h: 4 },
      { x: 4, y: 4, w: 4, h: 4 },
      { x: 8, y: 4, w: 4, h: 4 },
      { x: 0, y: 8, w: 4, h: 4 },
      { x: 4, y: 8, w: 4, h: 4 },
      { x: 8, y: 8, w: 4, h: 4 },
    ],
    "3x3🎞️",
    9,
  ),
];

/**
 * Default presets for vertical (20 rows x 12 cols) layouts.
 * Grid: 12 columns wide, 20 rows tall
 */
export const verticalPresets: LayoutPreset[] = [
  // 1 video with chat below
  createPreset(
    [
      { x: 0, y: 0, w: 12, h: 10 },
      { x: 0, y: 10, w: 12, h: 10, type: "chat", chatTab: 0 },
    ],
    "Mobile 1",
    1,
  ),

  // 2 videos stacked with chat
  createPreset(
    [
      { x: 0, y: 0, w: 12, h: 7 },
      { x: 0, y: 7, w: 12, h: 7 },
      { x: 0, y: 14, w: 12, h: 6, type: "chat" },
    ],
    "Mobile 2",
    2,
  ),

  // 3 videos stacked
  createPreset(
    [
      { x: 0, y: 0, w: 12, h: 7 },
      { x: 0, y: 7, w: 12, h: 7 },
      { x: 0, y: 14, w: 12, h: 6 },
    ],
    "Mobile 3",
    3,
  ),

  // 2x2 grid
  createPreset(
    [
      { x: 0, y: 0, w: 6, h: 10 },
      { x: 6, y: 0, w: 6, h: 10 },
      { x: 0, y: 10, w: 6, h: 10 },
      { x: 6, y: 10, w: 6, h: 10 },
    ],
    "Mobile 4",
    4,
  ),
];

/**
 * Get all presets for an aspect class (defaults + user custom).
 */
export function getPresetsForClass(
  aspectClass: AspectClass,
  userPresets: Record<AspectClass, LayoutPreset[]>,
): LayoutPreset[] {
  const defaults = {
    horizontal: horizontalPresets,
    square: squarePresets,
    vertical: verticalPresets,
  }[aspectClass];

  return [...defaults, ...userPresets[aspectClass]];
}

/**
 * Get the default layout for a given video count and aspect class.
 */
export function getDefaultLayout(
  videoCount: number,
  aspectClass: AspectClass,
  userPresets: Record<AspectClass, LayoutPreset[]>,
): LayoutPreset | undefined {
  const presets = getPresetsForClass(aspectClass, userPresets);

  // Find exact match first
  let preset = presets.find((p) => p.default === videoCount);

  // Fall back to next larger preset
  if (!preset) {
    preset = presets
      .filter((p) => p.default !== undefined && p.default >= videoCount)
      .toSorted((a, b) => (a.default ?? 0) - (b.default ?? 0))[0];
  }

  return preset;
}

// ============================================================================
// Cell Operations
// ============================================================================

/**
 * Find the first visible empty cell in the layout.
 */
export function findEmptyCell(cells: Cell[]): Cell | undefined {
  return cells.find(
    (cell) => cell.type === "empty" && cell.visibility === "visible",
  );
}

/**
 * Check if a layout matches any preset.
 */
export function isPresetLayout(
  cells: Cell[],
  aspectClass: AspectClass,
  userPresets: Record<AspectClass, LayoutPreset[]>,
): boolean {
  const currentEncoded = encodeLayout({ cells });
  const presets = getPresetsForClass(aspectClass, userPresets);
  return presets.some((p) => p.layout === currentEncoded);
}

/**
 * Hide a cell by setting visibility to 'hidden' (for append-only queue).
 */
export function hideCell(cell: Cell): Cell {
  return { ...cell, visibility: "hidden" };
}

/**
 * Validate that cells don't overlap and fit within grid.
 */
export function validateLayout(
  cells: Cell[],
  aspectClass: AspectClass,
): boolean {
  const { rows, cols } = GRID_DIMENSIONS[aspectClass];
  const grid: boolean[][] = Array.from({ length: rows }, () =>
    Array.from({ length: cols }, () => false),
  );

  for (const cell of cells) {
    if (cell.w <= 0 || cell.h <= 0) continue; // Skip hidden

    // Check bounds
    if (cell.x + cell.w > cols || cell.y + cell.h > rows) {
      return false;
    }

    // Check overlap
    for (let y = cell.y; y < cell.y + cell.h; y++) {
      for (let x = cell.x; x < cell.x + cell.w; x++) {
        if (grid[y][x]) return false;
        grid[y][x] = true;
      }
    }
  }

  return true;
}
