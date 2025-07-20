type CellType = "video" | "chat" | "placeholder";
type VideoCellStatus =
  | "paused"
  | "playing"
  | "buffering"
  | "buffered"
  | "ended"
  | "error";
type ChatCellStatus = "active" | "inactive";

interface BaseCell {
  id: string;
  type: CellType;
  x?: number; // x and y are based on grid position
  y?: number;
  w?: number; // w and h are in grid units
  h?: number;
}

interface VideoCell extends BaseCell {
  type: "video";
  status: VideoCellStatus;
  video: VideoBase;
}

interface ChatCell extends BaseCell {
  type: "chat";
  status: ChatCellStatus;
  channelId: string;
}

interface PlaceholderCell extends BaseCell {
  type: "placeholder";
  status?: undefined;
}

type Cell = VideoCell | ChatCell | PlaceholderCell;

interface MultiviewCells {
  cells: Cell[];
}
