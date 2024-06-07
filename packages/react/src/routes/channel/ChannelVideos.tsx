import { useOutletContext } from "react-router-dom";
import { ChannelOutletContext } from "../channel";
import { useChannelVideos } from "@/services/channel.service";
import { MainVideoListing } from "@/components/video/MainVideoListing";
import useMeasure from "react-use-measure";

export default function ChannelVideos({ type }: { type: ChannelVideoType }) {
  const { id, channel } = useOutletContext<ChannelOutletContext>();

  const {
    data: videos,
    isPending,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useChannelVideos(id, type);

  const [ref, bounds] = useMeasure({ scroll: false });

  return (
    <div className="container p-4 md:px-8" ref={ref}>
      <MainVideoListing
        isLoading={isPending}
        fetchNextPage={fetchNextPage}
        hasNextPage={hasNextPage}
        isFetchingNextPage={isFetchingNextPage}
        videos={videos?.pages.flat() ?? []}
        size="md"
        containerWidth={bounds.width}
      />
    </div>
  );
}
