export type Playlist = {
  id?: number;
  name: string;
  user_id: number | string;
  videos?: VideoRef[];
  /** client side maintained set */
  // _videoIdSet?: Set<string>;
};
export type PlaylistListItem = {
  id?: number;
  name: string;
  user_id: number | string;
  videos?: string[];
  updated_at: string;
};
export type PlaylistList = PlaylistListItem[];

export type User = {
  id: string;
  username: string;
  yt_channel_key?: string;
  role: string;
  created_at: string;
  contribution_count: string;
  twitter_id?: string;
  google_id?: string;
  discord_id?: string;
  api_key?: string;
};
