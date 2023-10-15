import { formatCount, formatDuration } from "@/lib/time";
import { Button } from "@/shadcn/ui/button";
import { Link } from "react-router-dom";
import { useSeconds } from "use-seconds";
import { format, formatDistanceToNowStrict } from "date-fns";
import { VideoMenu } from "./VideoMenu";
import { cn } from "@/lib/utils";
import { useMemo } from "react";

type VideoCard = VideoBase &
  Partial<Video> &
  Partial<Live> &
  Partial<Placeholder>;

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
  link,
  placeholderType,
  size,
  onInfoClick,
  onThumbnailClick,
  onChannelClick,
}: VideoCardProps) {
  const videoHref = useMemo(
    () => (status === "live" && link ? link : `/watch/${id}`),
    [status, link, id],
  );
  const thumbnailSrc = useMemo(
    () =>
      (() => {
        if (type === "placeholder") return thumbnail;
        switch (size) {
          case "sm":
            return `https://i.ytimg.com/vi/${id}/mqdefault.jpg`;
          case "md":
            return `https://i.ytimg.com/vi/${id}/mqdefault.jpg`;
          case "lg":
          default:
            return `https://i.ytimg.com/vi/${id}/hqdefault.jpg`;
        }
      })(),
    [type, thumbnail, id],
  );

  switch (size) {
    case "sm":
      return (
        <Link
          to={videoHref}
          target={placeholderType === "external-stream" ? "_blank" : undefined}
        >
          <div className="group flex relative py-2 gap-4">
            <div
              className="w-36 md:w-48 shrink-0 relative overflow-hidden"
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
                className="w-full h-full aspect-video object-cover rounded-md"
              />
              {topic_id && (
                <span className="bg-black/80 absolute top-1 left-1 px-1 rounded-sm text-sm text-white capitalize">
                  {topic_id}
                </span>
              )}
              <VideoCardDuration
                type={type}
                status={status}
                duration={duration}
                start_actual={start_actual}
                end_actual={end_actual}
                link={link}
                placeholderType={placeholderType}
              />
            </div>
            <div className="flex flex-col gap-1">
              <div className="pr-4 text-sm md:text-lg font-bold line-clamp-2">
                {title}
              </div>
              <Link
                to={`/channel/${channel?.id}`}
                className="text-xs md:text-sm text-base-11 hover:text-base-12 line-clamp-1"
              >
                {channel?.name}
              </Link>
              {status === "live" && (
                <div className="flex gap-1 text-base-11 text-xs md:text-sm">
                  <span className="text-red-500">Live now</span>
                  {!!live_viewers && (
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
                  <span className="text-base-11 text-xs md:text-sm line-clamp-1">
                    Starts in{" "}
                    {formatDistanceToNowStrict(new Date(start_scheduled))} (
                    {format(new Date(start_scheduled), "hh:mm a")})
                  </span>
                )}
              {status === "past" && available_at && (
                <span className="text-base-11 text-xs md:text-sm line-clamp-1">
                  {formatDistanceToNowStrict(new Date(available_at), {
                    addSuffix: true,
                  })}{" "}
                </span>
              )}
            </div>
            <VideoMenu id={id} type={type} status={status}>
              <Button
                variant="ghost"
                size="icon-lg"
                className="absolute right-0 top-2 rounded-full hidden group-hover:flex"
                onClickCapture={(e) => {
                  e.preventDefault();
                }}
              >
                <div className="i-heroicons:ellipsis-vertical w-4 h-4" />
              </Button>
            </VideoMenu>
          </div>
        </Link>
      );

    case "md":
    case "lg":
      return (
        <Link
          to={videoHref}
          target={placeholderType === "external-stream" ? "_blank" : undefined}
        >
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
              />
              {topic_id && (
                <span className="bg-black/80 absolute top-1 left-1 px-1 rounded-sm text-sm text-white capitalize">
                  {topic_id}
                </span>
              )}
              <VideoCardDuration
                type={type}
                status={status}
                duration={duration}
                start_actual={start_actual}
                end_actual={end_actual}
                link={link}
                placeholderType={placeholderType}
              />
            </div>
            <div className="flex relative gap-2">
              {channel && (
                <Link to={`/channel/${channel.id}`} className="shrink-0">
                  <img
                    src={channel.photo ?? ""}
                    className="w-8 h-8 rounded-full"
                  />
                </Link>
              )}
              {/* Set min-height because react-virtuoso will break if the height is not fixed */}
              <div className="flex flex-col gap-0 min-h-[6rem]">
                <div
                  className="pr-4 text-sm md:text-[1rem] md:leading-6 font-bold line-clamp-2"
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
                    <div className="text-xs md:text-sm text-base-11 hover:text-base-12 line-clamp-1">
                      {channel.name}
                    </div>
                  </Link>
                )}
                <div className="flex text-xs md:text-sm">
                  {status === "live" && (
                    <div className="flex gap-1 text-base-11">
                      <span className="text-red-500">Live now</span>
                      {!!live_viewers && (
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
}

function VideoCardDuration({
  type,
  status,
  duration,
  start_actual,
  end_actual,
  link,
  placeholderType,
}: Pick<
  VideoCard,
  | "type"
  | "status"
  | "duration"
  | "start_actual"
  | "end_actual"
  | "link"
  | "placeholderType"
>) {
  const [date] = useSeconds();

  const isPremiere = type === "stream" && status === "upcoming" && duration;

  // Duration in ms:
  // duration * 1000 (archive) or end_actual - start_actual (archive) or Date.now - start_actual (live)
  const durationMs =
    (type === "stream" && duration * 1000) ||
    (end_actual && start_actual
      ? new Date(end_actual).valueOf() - new Date(start_actual).valueOf()
      : start_actual
      ? date.valueOf() - new Date(start_actual).valueOf()
      : null);

  return durationMs ?? status === "upcoming" ? (
    <span
      className={cn(
        "flex justify-center items-center gap-1 bg-black/80 absolute bottom-1 right-1 px-1 rounded-sm text-sm text-white whitespace-nowrap",
        { "bg-red-700/80": status === "live" },
      )}
    >
      {placeholderType &&
        (link?.includes("twitch") ? (
          <div className="i-lucide:twitch" />
        ) : placeholderType === "external-stream" ? (
          <div className="i-lucide:radio text-lg m-1" />
        ) : (
          <div className="i-lucide:youtube text-lg m-1" />
        ))}
      {isPremiere ? "PREMIERE" : durationMs && formatDuration(durationMs)}
    </span>
  ) : null;
}
