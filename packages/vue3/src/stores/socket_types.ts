export interface TLDexMessage {
  timestamp: number | string;
  message: string;
  name: string; // name of creator
  channel_id?: string;
  // breakpoint?: boolean; // breakpoints are used to add styling separation
  receivedAt?: number;
  duration?: number;

  // TL Dex Live Message items:
  type?: string;
  is_tl?: boolean;
  is_owner?: boolean;
  is_vtuber?: boolean;
  is_moderator?: boolean;
  is_verified?: boolean;
}

export interface ParsedMessage extends TLDexMessage {
  parsed: string; // parsed output after parseMessage
  key: string;
  // relativeMs?: number;
}

export type VideoUpdatePayload = Pick<
  Video,
  "id" | "live_viewers" | "status" | "start_actual"
>;

export type TldexPayload = VideoUpdatePayload | TLDexMessage;
