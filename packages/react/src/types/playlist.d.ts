interface PlaylistStub {
  id: number;
  name: string;
  updated_at: string;
  user_id: string;
  video_ids: string[];
}

interface Playlist {
  id: number;
  name: string;
  user_id: string;
  videos: PlaylistVideo[];
}

interface PlaylistVideo {
  id: string;
  title: string;
  duration: number;
  topic_id: string;
  status: VideoStatus;
  type: VideoType;
  available_at: string;
  published_at: string;
}

interface PlaylistInclude {
	contains: boolean;
	id: number;
	name: string;
}
