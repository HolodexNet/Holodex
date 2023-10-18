interface Live extends VideoBase {
  channel: ShortChannel;
}

type PlaceholderType = "external-stream" | "scheduled-yt-stream";
type PlaceholderCertainty = "certain" | "likely";

interface Placeholder extends VideoBase {
  jp_name?: string;
  certainty: PlaceholderCertainty;
  link?: string;
  placeholderType?: PlaceholderType;
  thumbnail?: string;
  credits: {
    editor: {
      name: string;
      user: string;
    };
    bot: {
      link: string;
      name: string;
      user: string;
    };
  };
}
