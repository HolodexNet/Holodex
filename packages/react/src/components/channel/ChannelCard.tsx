import { formatCount } from "@/lib/time";
import { useFavoriteMutation, useFavorites } from "@/services/user.service";
import { Badge } from "@/shadcn/ui/badge";
import { Button } from "@/shadcn/ui/button";
import { useMemo } from "react";
import { Link } from "react-router-dom";

interface ChannelCardProps extends Channel { }

export function ChannelCard({
  id,
  name,
  photo,
  subscriber_count,
  video_count,
  clip_count,
  top_topics,
  twitter,
  twitch,
}: ChannelCardProps) {
  const { mutate, isLoading: mutateLoading } = useFavoriteMutation();
  const { data } = useFavorites();
  const isInFavorite = useMemo(
    () => data?.some((channel) => id === channel.id),
    [data],
  );

  return (
    // Set min-height because react-virtuoso will break if the height is not fixed
    <div className="w-full h-full min-h-[24rem] flex flex-col gap-2 items-center p-4 bg-base-3 rounded-md">
      <img className="w-24 h-24 rounded-full" src={photo ?? ""} />
      <div className="font-xl font-bold text-center line-clamp-2">{name}</div>
      <div className="flex flex-col items-center">
        <div className="text-sm text-base-11 whitespace-nowrap">
          {formatCount(subscriber_count ?? 0)} subscribers
        </div>
        <div className="flex flex-wrap justify-center gap-x-1 gap-y-0 text-sm text-base-11">
          <span className="whitespace-nowrap">{video_count ?? "0"} videos</span>
          <span>/</span>
          <span className="whitespace-nowrap">{clip_count ?? "0"} clips</span>
        </div>
      </div>
      {top_topics && <Badge variant="outline" className="capitalize">{top_topics[0]}</Badge>}
      <div className="flex grow" />
      <Button
        className="w-full"
        variant={isInFavorite ? "outline" : "secondary"}
        disabled={mutateLoading}
        onClick={() =>
          mutate([
            {
              op: isInFavorite ? "remove" : "add",
              channel_id: id,
            },
          ])
        }
      >
        {isInFavorite ? (
          <div className="i-heroicons:heart-solid" />
        ) : (
          <div className="i-heroicons:heart" />
        )}
        {isInFavorite ? "Unfavorite" : "Favorite"}
      </Button>
      <div className="w-full flex gap-2">
        <Button asChild className="w-full dark:text-white text-[#282828]" variant="ghost" size="icon-lg">
          {/* Youtube Logo needs to conform with YT guidelines https://www.youtube.com/howyoutubeworks/resources/brand-resources/#logos-icons-and-colors */}
          <Link to={`https://www.youtube.com/channel/${id}`} target="_blank">
            <div className="i-mdi:youtube" />
          </Link>
        </Button>
        {twitter && (
          <Button asChild className="w-full" variant="ghost" size="icon-lg">
            <Link to={`https://x.com/${twitter}`} target="_blank">
              <div className="i-lucide:twitter" />
            </Link>
          </Button>
        )}
        {twitch && (
          <Button asChild className="w-full" variant="ghost" size="icon-lg">
            <Link to={`https://twitch.tv/${twitch}`} target="_blank">
              <div className="i-lucide:twitch" />
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
}
