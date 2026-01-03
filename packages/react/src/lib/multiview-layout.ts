import type { AspectClass, Cell } from "@/store/multiview";

export const GRID_DIMENSIONS: Record<
  AspectClass,
  { rows: number; cols: number }
> = {
  horizontal: { rows: 12, cols: 20 },
  square: { rows: 12, cols: 12 },
  vertical: { rows: 20, cols: 12 },
};

// Base64 characters for encoding
export const b64 =
  "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_";

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
      visibility: "visible",
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
