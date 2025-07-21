import GridLayout from "react-grid-layout";

type CellType = "video" | "chat" | "placeholder";
type ChatCellStatus = "active" | "inactive";

interface BaseCell extends GridLayout.Layout {
  type: CellType;
}

interface VideoCell extends BaseCell {
  type: "video";
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
