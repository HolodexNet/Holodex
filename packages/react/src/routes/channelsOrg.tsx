import { ChannelCard } from "@/components/channel/ChannelCard";
import { useChannels } from "@/services/channel.service";
import { useParams, useSearchParams } from "react-router-dom";
import { VirtuosoGrid } from "react-virtuoso";

export function ChannelsOrg() {
  const { org } = useParams();
  // const [org, setOrg] = useAtom(orgAtom);

  const { data: channels, fetchNextPage: fetchChannels } = useChannels({ org, sort: 'suborg' });

  return (
    <div className="w-full h-full p-4 md:p-8">
      <VirtuosoGrid
        useWindowScroll
        listClassName="w-full grid grid-cols-[repeat(auto-fill,_minmax(240px,_1fr))] gap-x-4 gap-y-6"
        data={channels?.pages.flat() ?? []}
        itemContent={(_, channel) => <ChannelCard {...channel} />}
        endReached={async () => {
          await fetchChannels();
        }}
      />
    </div>
  );
}
