import { formatCount, formatDuration } from "@/lib/time";
import { Button } from "@/shadcn/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { useSeconds } from "use-seconds";
import { VideoMenu } from "./VideoMenu";
import { cn } from "@/lib/utils";
import { useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useAtomValue } from "jotai";
import { localeAtom } from "@/store/i18n";
import { useDuration } from "@/hooks/useDuration";

type VideoCardType = VideoBase &
  Partial<Video> &
  Partial<Live> &
  Partial<PlaceholderVideo>;

interface VideoCardProps extends VideoCardType {
  size: VideoCardSize;
  onInfoClick?: React.MouseEventHandler<HTMLElement>;
  onThumbnailClick?: React.MouseEventHandler<HTMLElement>;
  onChannelClick?: React.MouseEventHandler<HTMLElement>;
}

// export const wrapper = cva({
//   variants: {
//     size: {
//       default: "h-8 gap-2 px-3.5 py-2",
//       sm: "h-6 gap-1.5 rounded-md px-1 text-xs",
//       lg: "h-10 gap-3 rounded-md px-6 text-lg ",
//       icon: "h-8 w-8",
//       "icon-lg": "h-10 w-10 text-lg",
//     },
//   },
//   defaultVariants: {
//     size: "default",
//   },
// });

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
  const { dayjs } = useAtomValue(localeAtom);
  const { t } = useTranslation();

  const navigate = useNavigate();

  const isTwitch = link?.includes("twitch");
  const videoHref = useMemo(
    () => (!isTwitch && status === "live" && link ? link : `/watch/${id}`),
    [isTwitch, status, link, id],
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

  const videoTarget =
    !isTwitch && placeholderType === "external-stream" ? "_blank" : undefined;

  const goToVideoClickHandler = useCallback(
    (evt: React.MouseEvent<HTMLElement, MouseEvent>) => {
      console.info("goToVideoClickHandler", evt);
      if ((evt.target as HTMLAnchorElement).closest("#channelLink")) {
        return;
      }
      if (evt.ctrlKey) {
        window.open(videoHref, "_blank");
      } else {
        navigate(videoHref);
      }
    },
    [navigate, videoHref],
  );
  const goToVideoAuxClickHandler = useCallback(
    (evt: React.MouseEvent<HTMLElement, MouseEvent>) => {
      console.info("goToVideoAuxClickHandler", evt);
      if (
        evt.button === 1 &&
        !(evt.target as HTMLAnchorElement).closest("#channelLink")
      ) {
        window.open(videoHref, "_blank");
      }
    },
    [videoHref],
  );

  switch (size) {
    case "sm":
      return (
        <div className="group relative flex gap-4 py-2">
          <Link
            to={videoHref}
            target={videoTarget}
            className="relative w-36 shrink-0 overflow-hidden @lg:w-48"
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
          </Link>
          <div
            className="flex flex-col gap-1"
            onClick={goToVideoClickHandler}
            onAuxClick={goToVideoAuxClickHandler}
          >
            <Link
              to={videoHref}
              target={videoTarget}
              onClick={(e) => e.stopPropagation()}
              className="line-clamp-2 pr-4 text-sm font-bold @lg:text-lg"
            >
              {title}
            </Link>
            <Link
              id="channelLink"
              onClick={(e) => e.stopPropagation()}
              to={`/channel/${channel?.id}`}
              className="line-clamp-1 text-xs text-base-11 hover:text-base-12 @lg:text-sm"
            >
              {channel?.name}
            </Link>
            {status === "live" && (
              <div className="flex gap-1 text-xs text-base-11 @lg:text-sm">
                <span className="text-red-500">
                  {t("component.videoCard.liveNow")}
                </span>
                {!!live_viewers && (
                  <>
                    <span>/</span>
                    <span>
                      {t("component.videoCard.watching", {
                        0: formatCount(live_viewers),
                      })}
                    </span>
                  </>
                )}
              </div>
            )}
            {(type === "placeholder" || status === "upcoming") &&
              status !== "live" &&
              start_scheduled && (
                <span className="line-clamp-1 text-xs text-base-11 @lg:text-sm">
                  {t("time.diff_future_date", {
                    0: dayjs(start_scheduled).fromNow(false),
                    1: dayjs(start_scheduled).format("hh:mm A"),
                  })}
                </span>
              )}
            {status === "past" && available_at && (
              <span className="line-clamp-1 text-xs text-base-11 @lg:text-sm">
                {t("time.distance_past_date", {
                  0: dayjs(available_at).fromNow(false),
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
      );

    case "md":
    case "lg":
      return (
        <div className="group flex w-full flex-col gap-4">
          <Link
            to={videoHref}
            target={videoTarget}
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
          </Link>
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
            <div
              className="flex min-h-[6rem] cursor-pointer flex-col gap-0"
              onClick={goToVideoClickHandler}
              onMouseDown={goToVideoAuxClickHandler}
            >
              <Link
                className="line-clamp-2 pr-4 text-sm font-bold md:text-[1rem] md:leading-6"
                to={videoHref}
                target={videoTarget}
                onClick={
                  onInfoClick
                    ? (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onInfoClick(e);
                      }
                    : undefined
                }
              >
                {title}
              </Link>
              {channel && (
                <Link
                  id="channelLink"
                  to={`/channel/${channel.id}`}
                  onClick={
                    onChannelClick
                      ? (e) => {
                          e.preventDefault();
                          onChannelClick(e);
                        }
                      : (e) => e.stopPropagation()
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
                    <span className="text-red-500">
                      {t("component.videoCard.liveNow")}
                    </span>
                    {!!live_viewers && (
                      <>
                        <span>/</span>
                        <span>
                          {t("component.videoCard.watching", {
                            0: formatCount(live_viewers),
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
                      {t("time.diff_future_date", {
                        0: dayjs(start_scheduled).fromNow(false),
                        1: dayjs(start_scheduled).format("hh:mm A"),
                      })}
                    </span>
                  )}
                {status === "past" && available_at && (
                  <span className="text-base-11">
                    {t("time.distance_past_date", {
                      0: dayjs(available_at).fromNow(false),
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
  VideoCardType,
  | "type"
  | "status"
  | "duration"
  | "start_actual"
  | "end_actual"
  | "link"
  | "placeholderType"
>) {
  const { t } = useTranslation();
  const [date] = useSeconds();

  const isPremiere = type === "stream" && status === "upcoming" && duration;

  // Duration in ms:
  // duration * 1000 (archive) or end_actual - start_actual (archive) or Date.now - start_actual (live)
  const durationMs = useDuration({
    type,
    status,
    duration,
    end_actual,
    start_actual,
  });

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
      {isPremiere
        ? t("component.videoCard.premiere")
        : durationMs && formatDuration(durationMs)}
    </span>
  ) : null;
}
