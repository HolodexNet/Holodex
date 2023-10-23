type HolodexReportType = "video" | "channel" | "contact";

type HolodexReportBody<T> = T extends "video" | "contact"
  ? DiscordEmbedField[]
  : DiscordRequestBody;

// extracted common props from https://discord.com/developers/docs/resources/webhook#execute-webhook-jsonform-params
interface DiscordRequestBody {
  content?: string;
  embeds: DiscordEmbed[];
}

// extracted common props from https://discord.com/developers/docs/resources/channel#embed-object
interface DiscordEmbed {
  title: string;
  description?: string;
  url?: string;
  timestamp?: string;
  color?: number;
  fields: DiscordEmbedField[];
  author?: {
    name: string;
    url?: string;
    icon_url?: string;
    proxy_icon_url?: string;
  };
  footer?: {
    text: string;
    icon_url?: string;
    proxy_icon_url?: string;
  };
}

interface DiscordEmbedField {
  name: string;
  value: string;
  inline?: boolean;
}
