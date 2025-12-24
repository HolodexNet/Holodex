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

/**
 * Default presets for horizontal (12x20) layouts.
 * These presets use the same encoding as the Vue implementation.
 * Base64: A=0, B=1, ... L=11, M=12, ... Y=24, etc.
 * Format: xywh where x=col, y=row, w=width, h=height
 */
export const horizontalPresets: LayoutPreset[] = [
  { layout: "AAYY", name: "1🎞️", default: 1 },
  { layout: "AAUY,UAEYchat0", name: "Side Chat 1" },
  { layout: "AAMY,MAMY", name: "2🎞️", default: 2 },
  { layout: "AARM,AMRM,RAHYchat", name: "Side Chat 2" },
  { layout: "AAOM,AMOM,OAFYchat,TAFYchat", name: "2🎞️, 2💬" },
  { layout: "AAMY,MAMM,MMMM", name: "1🎞️+2", default: 3 },
  { layout: "AAMM,AMMM,MAMM,MMGMchat,SMGMchat", name: "3🎞️, 2💬" },
  { layout: "AAMM,AMMM,MAMM,MMMM", name: "2x2🎞️", default: 4 },
  { layout: "AAKM,KAKM,UAEMchat0,AMKM,KMKM,UMEMchat0", name: "2x2🎞️ 2💬" },
  { layout: "AAMP,APIJ,IPIJ,MAMP,QPIJ", name: "5🎞️", default: 5 },
  { layout: "AAIM,AMIM,IAIM,IMIM,QAIM,QMIM", name: "2x3🎞️", default: 6 },
  { layout: "AAJM,AMJM,JAJM,JMJM,SAGI,SIGI,SQGI", name: "7🎞️", default: 7 },
  {
    layout: "AAKM,AMKM,RAHI,KAHI,RQHI,KQHI,KIHI,RIHI",
    name: "8🎞️",
    default: 8,
  },
  {
    layout: "AAII,AIII,AQII,IAII,IIII,IQII,QAII,QIII,QQII",
    name: "3x3🎞️",
    default: 9,
  },
];

/**
 * Default presets for square (12x12) layouts.
 */
export const squarePresets: LayoutPreset[] = [
  { layout: "AALL", name: "1🎞️", default: 1 },
  { layout: "AALF,AFLF", name: "2🎞️ Side", default: 2 },
  { layout: "AAFL,AFFL", name: "2🎞️ Stacked" },
  { layout: "AAFF,FAFF,AFFF,FFFF", name: "2x2🎞️", default: 4 },
  {
    layout: "AADD,DADD,HADD,ADDD,DDDD,HDDD,AHDD,DHDD,HHDD",
    name: "3x3🎞️",
    default: 9,
  },
];

/**
 * Default presets for vertical (20x12) layouts.
 */
export const verticalPresets: LayoutPreset[] = [
  { layout: "AAYI,AIYQchat0", name: "Mobile 1", default: 1 },
  { layout: "AOYKchat,AAYH,AHYH", name: "Mobile 2", default: 2 },
  { layout: "AAYI,AIYI,AQYI", name: "Mobile 3", default: 3 },
  { layout: "AAMM,AMMM,MAMM,MMMM", name: "Mobile 4", default: 4 },
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
      .sort((a, b) => (a.default ?? 0) - (b.default ?? 0))[0];
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
