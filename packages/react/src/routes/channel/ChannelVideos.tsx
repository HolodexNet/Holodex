import { useOutletContext } from "react-router-dom";
import { ChannelOutletContext } from "../channel";
import { useChannelVideos } from "@/services/channel.service";
import { MainVideoListing } from "@/components/video/MainVideoListing";
import useMeasure from "react-use-measure";

export default function ChannelVideos() {
  const { id, channel } = useOutletContext<ChannelOutletContext>();
  const [ref, bounds] = useMeasure({ scroll: false });

  const {
    data: videos,
    isPending,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useChannelVideos(id, "videos");

  console.log(videos);

  return (
    <div className="container py-4" ref={ref}>
      <MainVideoListing
        isLoading={isPending}
        fetchNextPage={fetchNextPage}
        hasNextPage={hasNextPage}
        isFetchingNextPage={isFetchingNextPage}
        videos={videos?.pages.flat() ?? []}
        size={"lg"}
        className="@container grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-2"
        containerWidth={bounds.width}
      />
    </div>
  );
}
