import { formatCount, formatDuration } from "@/lib/time";
import { Button } from "@/shadcn/ui/button";
import { Link } from "react-router-dom";
import { useSeconds } from "use-seconds";
import { format, formatDistanceToNowStrict } from "date-fns";
import { VideoMenu } from "./VideoMenu";
import { cn } from "@/lib/utils";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";

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
  const { t } = useTranslation();

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
    [type, thumbnail, id, size],
  );

  switch (size) {
    case "sm":
      return (
        <Link
          to={videoHref}
          target={placeholderType === "external-stream" ? "_blank" : undefined}
        >
          <div className="group relative flex gap-4 py-2">
            <div
              className="relative w-36 shrink-0 overflow-hidden md:w-48"
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
                className="aspect-video h-full w-full rounded-md object-cover"
              />
              {topic_id && (
                <span className="absolute left-1 top-1 rounded-sm bg-black/80 px-1 text-sm capitalize text-white">
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
              <div className="line-clamp-2 pr-4 text-sm font-bold md:text-lg">
                {title}
              </div>
              <Link
                to={`/channel/${channel?.id}`}
                className="line-clamp-1 text-xs text-base-11 hover:text-base-12 md:text-sm"
              >
                {channel?.name}
              </Link>
              {status === "live" && (
                <div className="flex gap-1 text-xs text-base-11 md:text-sm">
                  <span className="text-red-500">{t("Live now")}</span>
                  {!!live_viewers && (
                    <>
                      <span>/</span>
                      <span>
                        {t("{{live_viewers}} watching", {
                          live_viewers: formatCount(live_viewers),
                        })}
                      </span>
                    </>
                  )}
                </div>
              )}
              {(type === "placeholder" || status === "upcoming") &&
                status !== "live" &&
                start_scheduled && (
                  <span className="line-clamp-1 text-xs text-base-11 md:text-sm">
                    {t("Starts in {{distance}} ({{time}})", {
                      distance: formatDistanceToNowStrict(
                        new Date(start_scheduled),
                      ),
                      time: format(new Date(start_scheduled), "hh:mm a"),
                    })}
                  </span>
                )}
              {status === "past" && available_at && (
                <span className="line-clamp-1 text-xs text-base-11 md:text-sm">
                  {formatDistanceToNowStrict(new Date(available_at), {
                    addSuffix: true,
                  })}
                </span>
              )}
            </div>
            <VideoMenu id={id} type={type} status={status}>
              <Button
                variant="ghost"
                size="icon-lg"
                className="absolute right-0 top-2 hidden rounded-full group-hover:flex"
                onClickCapture={(e) => {
                  e.preventDefault();
                }}
              >
                <div className="i-heroicons:ellipsis-vertical h-4 w-4" />
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
          <div className="group flex w-full flex-col gap-4">
            <div
              className="relative w-full"
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
                className="aspect-video w-full rounded-md object-cover"
              />
              {topic_id && (
                <span className="absolute left-1 top-1 rounded-sm bg-black/80 px-1 text-sm capitalize text-white">
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
            <div className="relative flex gap-2">
              {channel && (
                <Link to={`/channel/${channel.id}`} className="shrink-0">
                  <img
                    src={channel.photo ?? ""}
                    className="h-8 w-8 rounded-full"
                  />
                </Link>
              )}
              {/* Set min-height because react-virtuoso will break if the height is not fixed */}
              <div className="flex min-h-[6rem] flex-col gap-0">
                <div
                  className="line-clamp-2 pr-4 text-sm font-bold md:text-[1rem] md:leading-6"
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
                    <div className="line-clamp-1 text-xs text-base-11 hover:text-base-12 md:text-sm">
                      {channel.name}
                    </div>
                  </Link>
                )}
                <div className="flex text-xs md:text-sm">
                  {status === "live" && (
                    <div className="flex gap-1 text-base-11">
                      <span className="text-red-500">{t("Live now")}</span>
                      {!!live_viewers && (
                        <>
                          <span>/</span>
                          <span>
                            {t("{{live_viewers}} watching", {
                              live_viewers: formatCount(live_viewers),
                            })}
                          </span>
                        </>
                      )}
                    </div>
                  )}
                  {(type === "placeholder" || status === "upcoming") &&
                    status !== "live" &&
                    start_scheduled && (
                      <span className="text-base-11">
                        {t("Starts in {{distance}} ({{time}})", {
                          distance: formatDistanceToNowStrict(
                            new Date(start_scheduled),
                          ),
                          time: format(new Date(start_scheduled), "hh:mm a"),
                        })}
                      </span>
                    )}
                  {status === "past" && available_at && (
                    <span className="text-base-11">
                      {formatDistanceToNowStrict(new Date(available_at), {
                        addSuffix: true,
                      })}
                    </span>
                  )}
                </div>
              </div>
              <VideoMenu id={id} type={type} status={status}>
                <Button
                  variant="ghost"
                  size="icon-lg"
                  className="absolute -right-2 top-0 hidden rounded-full group-hover:flex"
                  onClickCapture={(e) => {
                    e.preventDefault();
                  }}
                >
                  <div className="i-heroicons:ellipsis-vertical h-4 w-4" />
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
          <div className="i-lucide:radio m-1 text-lg" />
        ) : (
          <div className="i-lucide:youtube m-1 text-lg" />
        ))}
      {isPremiere ? "PREMIERE" : durationMs && formatDuration(durationMs)}
    </span>
  ) : null;
}
