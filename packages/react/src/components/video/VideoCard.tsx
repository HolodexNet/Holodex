import { formatCount, formatDuration } from "@/lib/time";
import { Button } from "@/shadcn/ui/button";
import { Link } from "react-router-dom";
import { useSeconds } from "use-seconds";
import { format, formatDistanceToNowStrict } from "date-fns";
import { VideoMenu } from "./VideoMenu";
import { cn } from "@/lib/utils";

type VideoCard = VideoBase & Partial<Video> & Partial<Live>;

interface VideoCardProps extends VideoCard {
  size: VideoCardSize;
  onInfoClick?: React.MouseEventHandler<HTMLDivElement>;
  onThumbnailClick?: React.MouseEventHandler<HTMLDivElement>;
  onChannelClick?: React.MouseEventHandler<HTMLAnchorElement>;
}

export function VideoCard({
  id,
  topic_id,
  status,
  type,
  duration,
  start_actual,
  start_scheduled,
  end_actual,
  available_at,
  title,
  channel,
  thumbnail,
  live_viewers,
  size,
  onInfoClick,
  onThumbnailClick,
  onChannelClick,
}: VideoCardProps) {
  const thumbnailSrc = (() => {
    if (type === "placeholder") return thumbnail;
    switch (size) {
      case "sm":
        return `https://i.ytimg.com/vi/${id}/default.jpg`;
      case "md":
        return `https://i.ytimg.com/vi/${id}/mqdefault.jpg`;
      case "lg":
      default:
        return `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
    }
  })();

  switch (size) {
    case "sm":
      return (
        <Link to={onThumbnailClick ? "" : `/watch/${id}`}>
          <div className="flex p-4">
            <img src={thumbnailSrc} />
            <div className="flex flex-col gap-4">
              <div className="text-lg font-bold">{title}</div>
              <div>{}</div>
            </div>
          </div>
        </Link>
      );

    default:
      break;
  }

  return (
    <Link to={`/watch/${id}`}>
      <div className="group w-full flex flex-col gap-4">
        <div
          className="w-full relative"
          onClick={
            onThumbnailClick
              ? (e) => {
                  e.preventDefault();
                  onThumbnailClick(e);
                }
              : undefined
          }
        >
          <img
            src={thumbnailSrc}
            className="w-full aspect-video object-cover rounded-md"
            onClick={onThumbnailClick}
          />
          {topic_id && (
            <span className="bg-black/80 absolute top-1 left-1 px-1 rounded-sm text-sm text-white capitalize">
              {topic_id}
            </span>
          )}
          {status !== "upcoming" && (
            <VideoCardDuration
              status={status}
              duration={duration}
              start_actual={start_actual}
              end_actual={end_actual}
            />
          )}
        </div>
        <div className="flex relative gap-2">
          {channel && (
            <Link to={`/channel/${channel.id}`} className="shrink-0">
              <img src={channel.photo ?? ""} className="w-8 h-8 rounded-full" />
            </Link>
          )}
          <div className="flex flex-col gap-0">
            <div
              className="pr-4 text-md font-bold line-clamp-2"
              onClick={
                onInfoClick
                  ? (e) => {
                      e.preventDefault();
                      onInfoClick(e);
                    }
                  : undefined
              }
            >
              {title}
            </div>
            {channel && (
              <Link
                to={`/channel/${channel.id}`}
                onClick={
                  onChannelClick
                    ? (e) => {
                        e.preventDefault();
                        onChannelClick(e);
                      }
                    : undefined
                }
              >
                <div className="text-sm text-base-11 line-clamp-1">
                  {channel.name}
                </div>
              </Link>
            )}
            <div className="flex text-sm">
              {status === "live" && (
                <div className="flex gap-1 text-base-11">
                  <span className="text-red-500">Live now</span>
                  {live_viewers && (
                    <>
                      <span>/</span>
                      <span>{formatCount(live_viewers)} watching</span>
                    </>
                  )}
                </div>
              )}
              {(type === "placeholder" || status === "upcoming") &&
                status !== "live" &&
                start_scheduled && (
                  <span className="text-base-11">
                    Starts in{" "}
                    {formatDistanceToNowStrict(new Date(start_scheduled))} (
                    {format(new Date(start_scheduled), "hh:mm a")})
                  </span>
                )}
              {status === "past" && available_at && (
                <span className="text-base-11">
                  {formatDistanceToNowStrict(new Date(available_at), {
                    addSuffix: true,
                  })}{" "}
                </span>
              )}
            </div>
          </div>
          <VideoMenu id={id} type={type} status={status}>
            <Button
              variant="ghost"
              size="icon-lg"
              className="absolute -right-2 top-0 rounded-full hidden group-hover:flex"
              onClickCapture={(e) => {
                e.preventDefault();
              }}
            >
              <div className="i-heroicons:ellipsis-vertical w-4 h-4" />
            </Button>
          </VideoMenu>
        </div>
      </div>
    </Link>
  );
}

function VideoCardDuration({
  status,
  duration,
  start_actual,
  end_actual,
}: Pick<VideoCard, "status" | "duration" | "start_actual" | "end_actual">) {
  const [date] = useSeconds();

  const durationMs =
    duration * 1000 ||
    (end_actual && start_actual
      ? new Date(end_actual).valueOf() - new Date(start_actual).valueOf()
      : start_actual
      ? date.valueOf() - new Date(start_actual).valueOf()
      : null);

  return durationMs ? (
    <span
      className={cn(
        "bg-black/80 absolute bottom-1 right-1 px-1 rounded-sm text-sm text-white whitespace-nowrap",
        { "bg-red-700/80": status === "live" },
      )}
    >
      {formatDuration(durationMs)}
    </span>
  ) : null;
}
