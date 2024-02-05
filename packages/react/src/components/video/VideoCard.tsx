import { formatCount, formatDuration } from "@/lib/time";
import { Button } from "@/shadcn/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { VideoMenu } from "./VideoMenu";
import { cn, makeYtThumbnailUrl } from "@/lib/utils";
import { useCallback, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useAtomValue } from "jotai";
import { localeAtom } from "@/store/i18n";
import { useDuration } from "@/hooks/useDuration";
import { clsx } from "clsx";
import { VideoThumbnail } from "../image";

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
  ...rest
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
    () => (type === "placeholder" ? thumbnail : makeYtThumbnailUrl(id, size)),
    [type, thumbnail, id, size],
  );
  const externalLink = useMemo(
    () => (type === "placeholder" ? link : `https://youtu.be/${id}`),
    [type, link, id],
  );

  const videoTarget =
    !isTwitch && placeholderType === "external-stream" ? "_blank" : undefined;

  const videoObject = useMemo(
    () => ({
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
      ...rest,
    }),
    [
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
      rest,
    ],
  );

  const goToVideoClickHandler = useCallback(
    (evt: React.MouseEvent<HTMLElement, MouseEvent>) => {
      console.info("goToVideoClickHandler", evt);
      if ((evt.target as HTMLAnchorElement).closest("#channelLink")) {
        console.info("no action b/c closest element is a channel link.", evt);
        return;
      }
      if (evt.ctrlKey) {
        window.open(videoHref, "_blank");
      } else {
        navigate(videoHref, {
          state: { video: videoObject },
        });
        evt.preventDefault();
        evt.stopPropagation();
      }
    },
    [navigate, videoHref, videoObject],
  );
  const goToVideoAuxClickHandler = useCallback(
    (evt: React.MouseEvent<HTMLElement, MouseEvent>) => {
      if (
        evt.button === 1 &&
        !(evt.target as HTMLAnchorElement).closest("#channelLink")
      ) {
        console.info("goToVideoAuxClickHandler", evt);
        window.open(videoHref, "_blank");
      }
    },
    [videoHref],
  );

  const videoMenu = (
    <VideoMenu url={externalLink} {...videoObject}>
      <Button
        variant="ghost"
        size="icon-lg"
        className="absolute right-0 top-0 h-8 w-6 rounded-sm opacity-0 group-hover:opacity-100"
        onClickCapture={(e) => {
          e.preventDefault();
        }}
      >
        <div className="i-heroicons:ellipsis-vertical h-6 w-6" />
      </Button>
    </VideoMenu>
  );

  const videoCardClasses = useMemo(
    () => ({
      outerLayer: clsx([
        (size == "xs" || size == "sm") && "group relative flex gap-4 py-2",
        (size == "md" || size == "lg") && "group flex w-full flex-col gap-4",
      ]),
      thumbnailLink: clsx([
        size == "xs" && "relative w-28 shrink-0 overflow-hidden @lg:w-36",
        size == "sm" && "relative w-36 shrink-0 overflow-hidden @lg:w-48",
        (size == "md" || size == "lg") && "relative w-full",
      ]),
      videoTextInfo: clsx([
        (size == "xs" || size == "sm") && "flex flex-col gap-1",
        (size == "md" || size == "lg") &&
          "flex min-h-[6rem] cursor-pointer flex-col gap-0",
      ]),
      titleLink: clsx([
        (size == "xs" || size == "sm") &&
          "line-clamp-2 pr-4 text-sm font-bold @lg:text-lg",
        (size == "md" || size == "lg") &&
          "line-clamp-2 pr-4 text-sm font-bold md:text-[1rem] md:leading-6",
      ]),
      channelLink:
        "line-clamp-1 text-xs text-base-11 hover:text-base-12 @lg:text-sm",
      scheduleText: "text-xs @lg:text-sm text-base-11",
    }),
    [size],
  );

  return (
    <div className={videoCardClasses.outerLayer}>
      <Link
        to={videoHref}
        target={videoTarget}
        state={{ video: videoObject }}
        className={videoCardClasses.thumbnailLink}
        onClick={
          onThumbnailClick
            ? (e) => {
                e.preventDefault();
                onThumbnailClick(e);
              }
            : undefined
        }
      >
        <VideoThumbnail
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
      <div className="relative flex gap-2 @sm:gap-1">
        {(size == "lg" || size == "md") && channel && (
          <Link
            to={`/channel/${channel.id}`}
            className="shrink-0"
            onClick={(e) => e.stopPropagation()}
          >
            <img src={channel.photo ?? ""} className="h-8 w-8 rounded-full" />
          </Link>
        )}
        {/* Set min-height because react-virtuoso will break if the height is not fixed */}
        <div
          className={videoCardClasses.videoTextInfo}
          onClick={goToVideoClickHandler}
          onMouseDown={goToVideoAuxClickHandler}
        >
          <Link
            className={videoCardClasses.titleLink}
            to={videoHref}
            state={{ video: videoObject }}
            target={videoTarget}
            onClick={
              onInfoClick
                ? (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onInfoClick(e);
                  }
                : (e) => {
                    e.stopPropagation();
                  }
            }
          >
            {title}
          </Link>
          {channel && (
            <Link
              className={videoCardClasses.channelLink}
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
              {channel.name}
            </Link>
          )}
          {size != "xs" && (
            <div className={videoCardClasses.scheduleText}>
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
          )}
        </div>
        {videoMenu}
      </div>
    </div>
  );
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
