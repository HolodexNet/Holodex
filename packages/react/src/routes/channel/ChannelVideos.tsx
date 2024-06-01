import { useOutletContext } from "react-router-dom";
import { ChannelOutletContext } from "../channel";
import { useChannelVideos } from "@/services/channel.service";
import { MainVideoListing } from "@/components/video/MainVideoListing";

export default function ChannelVideos() {
  const { id, channel } = useOutletContext<ChannelOutletContext>();

  const {
    data: videos,
    isPending,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useChannelVideos(id, "videos");

  console.log(videos);

  return (
    <div className="container py-4">
      <MainVideoListing
        isLoading={isPending}
        fetchNextPage={fetchNextPage}
        hasNextPage={hasNextPage}
        isFetchingNextPage={isFetchingNextPage}
        videos={videos?.pages.flat() ?? []}
        size="md"
      />
    </div>
  );
}
