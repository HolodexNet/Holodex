import { ChannelImg } from "../channel/ChannelImg";

export function Mentions({ mentions }: { mentions: ShortChannel[] }) {
  return (
    <div className="flex flex-row gap-2 rounded-lg bg-base-3 p-4">
      {mentions.map((mention) => (
        <ChannelImg
          key={mention.id}
          className="h-14"
          channelId={mention.id}
          photo={mention.photo}
          size={40}
        />
      ))}
    </div>
  );
}
