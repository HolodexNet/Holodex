import type { AspectClass, Cell, LayoutPreset } from "@/store/multiview";
import { GRID_DIMENSIONS } from "@/store/multiview";

// Base64 characters for encoding
const b64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";

/**
 * Generate a random 8-character base64 ID for cell identification.
 */
export function generateContentId(): string {
  return Array.from({ length: 8 })
    .map(() => b64[Math.floor(Math.random() * b64.length)])
    .join("");
}

/**
 * Determine aspect class from viewport dimensions.
 */
export function getAspectClass(width: number, height: number): AspectClass {
  const ratio = width / height;
  if (ratio >= 1.5) return "horizontal";
  if (ratio <= 0.75) return "vertical";
  return "square";
}

// ============================================================================
// Layout Encoding/Decoding
// ============================================================================

interface EncodeOptions {
  cells: Cell[];
  includeVideo?: boolean;
}

/**
 * Encode a layout to a compact URL-safe string.
 * Format: "xywh[content],xywh[content],..."
 * - x, y, w, h are base64 encoded (single char each, max 63)
 * - content is either empty, "chat{tab}", or video ID
 */
export function encodeLayout({
  cells,
  includeVideo = false,
}: EncodeOptions): string {
  const parts: string[] = [];

  for (const cell of cells) {
    // Skip hidden cells (w=0 or h=0)
    if (cell.w <= 0 || cell.h <= 0) continue;

    // Validate coordinates fit in base64 range
    if (cell.x >= 64 || cell.y >= 64 || cell.w >= 64 || cell.h >= 64) continue;

    let encoded = "";
    encoded += b64[cell.x];
    encoded += b64[cell.y];
    encoded += b64[cell.w];
    encoded += b64[cell.h];

    if (cell.type === "chat") {
      encoded += `chat${cell.chatTab ?? 0}`;
    } else if (cell.type === "video" && includeVideo && cell.videoId) {
      encoded += cell.videoId;
    }

    parts.push(encoded);
  }

  return parts.join(",");
}

interface DecodeResult {
  id: string;
  cells: Cell[];
  videoCellCount: number;
}

/**
 * Decode a layout string back to cells and content.
 */
export function decodeLayout(encodedStr: string): DecodeResult {
  const cells: Cell[] = [];
  let videoCellCount = 0;

  const parts = encodedStr.split(",").filter(Boolean);
  parts.sort(); // Maintain consistent ordering

  for (const str of parts) {
    const id = generateContentId();
    const xywh = str.substring(0, 4);
    const content = str.substring(4);

    const isChat = content.startsWith("chat");
    const chatTab =
      isChat && content.length > 4 ? parseInt(content[4], 10) : undefined;
    const videoId = !isChat && content.length === 11 ? content : undefined;

    const cell: Cell = {
      id,
      x: b64.indexOf(xywh[0]),
      y: b64.indexOf(xywh[1]),
      w: b64.indexOf(xywh[2]),
      h: b64.indexOf(xywh[3]),
      type: isChat ? "chat" : videoId ? "video" : "empty",
      ...(videoId && { videoId }),
      ...(chatTab !== undefined && { chatTab }),
    };

    cells.push(cell);

    if (!isChat) {
      videoCellCount++;
    }
  }

  return {
    id: encodedStr,
    cells,
    videoCellCount,
  };
}

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
 * Find the first empty cell in the layout.
 */
export function findEmptyCell(cells: Cell[]): Cell | undefined {
  return cells.find(
    (cell) => cell.type === "empty" && cell.w > 0 && cell.h > 0,
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
 * Hide a cell by setting its dimensions to 0 (for append-only queue).
 */
export function hideCell(cell: Cell): Cell {
  return { ...cell, w: 0, h: 0 };
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
