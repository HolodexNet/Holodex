interface Song {
  channel_id: string;
  channel: Pick<ChannelBase, "name" | "english_name">;
  video_id: string;
  name: string;
  start: number;
  end: number;
  available_at: string;
  original_artist: string;
  art: string | null;
  itunesid: number | null;
  song:
    | (Pick<
        ITunesSong,
        | "artistName"
        | "artworkUrl100"
        | "collectionName"
        | "releaseDate"
        | "trackId"
        | "trackName"
        | "trackTimeMillis"
        | "trackViewUrl"
      > & {
        index: `iTunes${number}`;
        src: "iTunes";
      })
    | null;
  amUrl: string | null;
  // creator_id,
  // approver_id,
}

type ITunesSongWrapperType = "track" | "collection" | "artist";
type ITunesSongKind =
  | "book"
  | "album"
  | "coached-audio"
  | "feature-movie"
  | "interactive-booklet"
  | "music-video"
  | "pdf"
  | "podcast"
  | "podcast-episode"
  | "software-package"
  | "song"
  | "tv-episode"
  | "artist";
type ITunesSongExplicitness = "explicit" | "cleaned" | "notExplicit";

interface ITunesSong {
  wrapperType: ITunesSongWrapperType;
  kind: ITunesSongKind;
  trackName: string;
  artistName: string;
  collectionName: string;
  collectionCensoredName: string;
  trackCensoredName: string;
  collectionExplicitness: ITunesSongExplicitness;
  trackExplicitness: ITunesSongExplicitness;
  artworkUrl30: `https://is1-ssl.mzstatic.com/image/thumb/Music/${string}/30x30bb.jpg`;
  artworkUrl60: `https://is1-ssl.mzstatic.com/image/thumb/Music/${string}/60x60bb.jpg`;
  artworkUrl100: `https://is1-ssl.mzstatic.com/image/thumb/Music/${string}/100x100bb.jpg`;
  artistViewUrl: `https://music.apple.com/${string}/artist/${string}`;
  collectionViewUrl: `https://music.apple.com/${string}/album/${string}`;
  trackViewUrl: `https://music.apple.com/${string}/album/${string}`;
  previewUrl: this["wrapperType"] extends "track"
    ? `https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview125/${string}`
    : never;
  artistId: number;
  collectionId: number;
  trackId: number;
  collectionPrice: number;
  trackPrice: number;
  releaseDate: string;
  discCount: number;
  discNumber: number;
  trackCount: number;
  trackNumber: number;
  trackTimeMillis: number;
  country: string;
  currency: string;
  primaryGenreName: string;
  isStreamable: boolean;
}

interface ITunesSongSearchResult {
  resultCount: number;
  results: ITunesSong[];
}
