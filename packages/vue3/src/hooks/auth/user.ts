export interface User {
  api_key: string;
  contribution_count: string;
  created_at: string;
  discord_id: string | null;
  google_id: string | null;
  twitter_id: string | null;
  id: string;
  role: string;
  username: string;
  yt_channel_key: string | null;
}

export interface LoginResponse {
  jwt: string;
  user: User;
}
