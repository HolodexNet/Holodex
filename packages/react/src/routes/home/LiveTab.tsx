import { useLive } from "@/services/live.service";
import { MainVideoListing } from "@/components/video/MainVideoListing";
import { Separator } from "@/shadcn/ui/separator";
import { useParams } from "react-router-dom";
import { useVideoCardSizes } from "@/store/video";

export function LiveTab() {
  const { org } = useParams();
  const { size: cardSize } = useVideoCardSizes(["list", "md", "lg"]);
  const { data: live, isLoading: liveLoading } = useLive(
    { org, type: ["placeholder", "stream"], include: ["mentions"] },
    { refetchInterval: 1000 * 60 * 5 },
  );

  return (
    <>
      <MainVideoListing
        isLoading={liveLoading}
        size={cardSize}
        videos={live?.filter(({ status }) => status === "live") ?? []}
      />
      <Separator className="mb-4 mt-2 w-full border-base-3 lg:mb-6 lg:mt-4" />
      <MainVideoListing
        isLoading={liveLoading}
        size={cardSize}
        videos={live?.filter(({ status }) => status !== "live") ?? []}
      />
    </>
  );
}
