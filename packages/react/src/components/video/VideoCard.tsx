import { VideoCardCountdownToLive } from "./VideoCardCountdownToLive";
import { formatDuration } from "@/lib/time";
import { Button } from "@/shadcn/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { VideoMenu } from "./VideoMenu";
import { cn, makeYtThumbnailUrl, resizeChannelPhoto } from "@/lib/utils";
import React, { Suspense, useCallback, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useDuration } from "@/hooks/useDuration";
import { clsx } from "clsx";
import { VideoThumbnail } from "./VideoThumbnail";
import { usePreferredName } from "@/store/settings";
import { useAtomValue } from "jotai";
import { selectedVideoSetReadonlyAtom } from "@/hooks/useVideoSelection";

export type VideoCardType = VideoRef &
  Partial<VideoBase> &
  Partial<Video> &
  Partial<Live> &
  Partial<PlaceholderVideo>;

export type OnClickHandler = (
  part: "full" | "title" | "thumbnail" | "channel" | "info",
  video: VideoCardType,
  event: React.MouseEvent,
) => void;

interface VideoCardProps {
  video: VideoCardType;
  size: VideoCardSize;
  /**
   *
   * onClick handler for the Video Card. It will be called with two arguments:
   * - part: The part of the card that was clicked ("full", "info", "thumbnail", or "channel")
   * - event: The original React mouse event
   *
   * This handler allows custom click behavior for different parts of the card.
   * If provided, it overrides the default navigation behavior.
   *
   * Note: This handler does not automatically prevent default behavior or stop propagation.
   * If needed, you can call event.preventDefault() and/or event.stopPropagation()
   * within your handler to control event behavior.
   */
  onClick?: OnClickHandler;
  showDuration?: boolean;
}

const LazyVideoCardPlaceholder = React.lazy(
  () => import("./VideoCardPlaceholder"),
);

export const MemoizedVideoCard = React.memo(VideoCard);

export function VideoCard({
  video,
  size,
  onClick,
  showDuration = true,
}: VideoCardProps) {
  const navigate = useNavigate();

  const isTwitch = video.link?.includes("twitch");
  const videoHref =
    !isTwitch && video.status === "live" && video.link
      ? video.link
      : `/watch/${video.id}`;

  const thumbnailSrc =
    video.type === "placeholder"
      ? video.thumbnail
      : makeYtThumbnailUrl(video.id, size);

  const externalLink =
    video.type === "placeholder" ? video.link : `https://youtu.be/${video.id}`;

  const videoTarget =
    !isTwitch && video.placeholderType === "external-stream"
      ? "_blank"
      : undefined;

  const [open, setOpen] = useState(false); // placeholder popup state.

  const selectedSet = useAtomValue(selectedVideoSetReadonlyAtom);

  const goToVideoClickHandler = useCallback(
    (evt: React.MouseEvent<HTMLElement, MouseEvent>) => {
      if ((evt.target as HTMLElement).closest("a")) {
        if (video.type === "placeholder") {
          console.info("took over click.", evt);
          setOpen(true);
          evt.preventDefault();
          evt.stopPropagation();
          return;
        }
        console.info("no action b/c closest element is a link.", evt);
        return;
      }
      console.info("JS video click handling", evt);
      // clicked a non-link part of the video card.
      if (evt.ctrlKey) {
        /** Control clicking a non-link part always goes to the external link no matter what the context */
        window.open(videoHref, "_blank");
        evt.preventDefault();
        evt.stopPropagation();
      } else {
        if (video.type === "placeholder") {
          setOpen(true);
          evt.preventDefault();
          evt.stopPropagation();
          return;
        }
        navigate(videoHref, {
          state: { video },
        });
        evt.preventDefault();
        evt.stopPropagation();
      }
    },
    [videoHref, navigate, video],
  );

  /**
   * Alt clicking always goes to the external link no matter what the context.
   */
  const goToVideoAuxClickHandler = useCallback(
    (evt: React.MouseEvent<HTMLElement, MouseEvent>) => {
      if (evt.button === 1 && !(evt.target as HTMLElement).closest("a")) {
        console.info("goToVideoAuxClickHandler", evt);
        window.open(videoHref, "_blank");
        evt.preventDefault();
        evt.stopPropagation();
      }
    },
    [videoHref],
  );

  const videoCardClasses = useMemo(
    () => ({
      outerLayer: clsx([
        size == "list" && "rounded-sm hover:bg-base-3 @lg:px-2",
        (size == "list" || size == "sm") && "group relative flex gap-4 py-2",
        (size == "md" || size == "lg") && "group flex w-full flex-col gap-4",
        onClick && "cursor-pointer",
        selectedSet?.includes(video.id) &&
          "ring-offset-base-2 ring-offset-2 ring-2 ring-primary rounded-lg",
      ]),
      thumbnailLink: clsx([
        size == "list" &&
          "@lg:w-36 relative aspect-video w-28 shrink-0 overflow-hidden",
        size == "sm" && "@lg:w-48 relative w-36 shrink-0 overflow-hidden",
        (size == "md" || size == "lg") && "relative w-full",
      ]),
      videoTextInfo: clsx([
        (size == "list" || size == "sm") && "flex flex-col gap-1",
        (size == "md" || size == "lg") &&
          "flex min-h-[6rem] cursor-pointer flex-col gap-0",
      ]),
      titleLink: clsx([
        (size == "list" || size == "sm") &&
          "@lg:text-lg line-clamp-2 pr-4 text-sm font-bold",
        (size == "md" || size == "lg") &&
          "line-clamp-2 pr-4 text-sm font-bold md:text-[1rem] md:leading-6",
      ]),
      channelLink:
        "line-clamp-1 text-xs text-base-11 hover:text-base-12 @lg:text-sm",
      scheduleText: "text-sm @lg:text-sm text-base-11",
    }),
    [onClick, size, selectedSet, video.id],
  );

  const videoMenu = (
    <VideoMenu url={externalLink} video={video}>
      <Button
        variant="ghost"
        size="icon-lg"
        className="absolute right-0 top-0 h-8 w-6 rounded-sm opacity-0 group-hover:opacity-100"
        onClickCapture={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
      >
        <div className="i-heroicons:ellipsis-vertical h-6 w-6" />
      </Button>
    </VideoMenu>
  );

  const chName = usePreferredName(video.channel);

  return (
    <div
      className={videoCardClasses.outerLayer}
      onClick={(e) =>
        onClick ? onClick("full", video, e) : goToVideoClickHandler(e)
      }
    >
      {/* Thumbnail for the video */}
      <Link
        to={videoHref}
        target={videoTarget}
        state={{ video }}
        className={videoCardClasses.thumbnailLink}
        onClick={(e) =>
          onClick ? onClick("thumbnail", video, e) : goToVideoClickHandler(e)
        }
      >
        <VideoThumbnail
          src={thumbnailSrc}
          className={
            (video.type === "placeholder" &&
              "brightness-75 saturate-[0.75] transition-[filter] duration-300 ease-in-out group-hover:brightness-100 group-hover:saturate-100") +
            " aspect-video h-full w-full rounded-md object-cover "
          }
        />
        {video.topic_id && (
          <span className="absolute left-1 top-1 text-pretty rounded-sm bg-black/80 px-1 text-sm capitalize text-white/80 group-hover:text-white">
            {video.topic_id.replaceAll("_", " ")}
          </span>
        )}
        <div className="absolute bottom-1 right-1 flex flex-col items-end gap-1">
          {video.songcount && (
            <span className="text-pretty rounded-sm bg-black/80 px-1 text-sm capitalize text-white/80 group-hover:text-white">
              <div
                className="i-lucide:music-4 inline-block align-middle"
                style={{ fontSize: "11px", lineHeight: "1.25rem" }}
              />
              &nbsp;{video.songcount}
            </span>
          )}
          {showDuration && <VideoCardDuration className="" {...video} />}
        </div>
      </Link>
      {/* This block contains the entire bottom of the video card, which is the channel thumbnail + Video Text Info + Menu */}
      <div className="relative flex grow gap-2 @sm:gap-1">
        {/* Channel thumbnail, only drawn on large & medium video cards */}
        {(size == "lg" || size == "md") && video.channel && (
          <Link
            to={`/channel/${video.channel.id}`}
            id="channelLink"
            className="shrink-0"
            onClick={(e) => onClick && onClick("channel", video, e)}
          >
            <img
              src={
                video.channel.photo &&
                resizeChannelPhoto(video.channel.photo, 64)
              }
              className="h-8 w-8 rounded-full"
            />
          </Link>
        )}

        {/* This block contains the Video Text Info: Title, Channel, Schedule. */}
        <div
          className={videoCardClasses.videoTextInfo}
          onClick={(e) =>
            onClick ? onClick("info", video, e) : goToVideoClickHandler(e)
          }
          onMouseDown={goToVideoAuxClickHandler}
        >
          <Link
            className={videoCardClasses.titleLink}
            to={videoHref}
            state={{ video }}
            target={videoTarget}
            onClick={(e) =>
              onClick ? onClick("title", video, e) : goToVideoClickHandler(e)
            }
          >
            {video.title}
          </Link>
          {video.channel && (
            <Link
              className={videoCardClasses.channelLink}
              id="channelLink"
              to={`/channel/${video.channel.id}`}
              onClick={(e) => onClick && onClick("channel", video, e)}
            >
              {chName}
            </Link>
          )}
          {size != "xs" && (
            <div className={videoCardClasses.scheduleText}>
              <VideoCardCountdownToLive video={video} />
            </div>
          )}
        </div>
        {videoMenu}
        <div onClick={stopPropagation} onMouseDown={stopPropagation}>
          <Suspense fallback={null}>
            <LazyVideoCardPlaceholder
              open={open}
              setOpen={setOpen}
              video={video}
            />
          </Suspense>
        </div>
      </div>
    </div>
  );
}

function stopPropagation<
  T extends React.MouseEvent<HTMLDivElement, MouseEvent>,
>(e: T) {
  e.stopPropagation();
}

function VideoCardDuration({
  type,
  status,
  duration,
  start_actual,
  end_actual,
  link,
  placeholderType,
  className,
  certainty,
}: Pick<
  VideoCardType,
  | "type"
  | "status"
  | "duration"
  | "start_actual"
  | "end_actual"
  | "link"
  | "certainty"
  | "placeholderType"
> & { className?: string }) {
  const { t } = useTranslation();

  const isPremiere = type === "stream" && status === "upcoming" && duration;

  // Duration in ms:
  // duration * 1000 (archive) or end_actual - start_actual (archive) or Date.now - start_actual (live)
  const durationMs = useDuration({
    type,
    status,
    duration: duration ?? 0,
    end_actual,
    start_actual,
  });

  // generate the icon to use:
  let placeholderIcon;
  if (placeholderType === "external-stream") {
    if (link?.includes("twitch.tv")) {
      placeholderIcon = "i-tabler:brand-twitch";
    } else if (link?.includes("twitcasting.tv") || link?.includes("x.com")) {
      placeholderIcon = "i-tabler:brand-twitter";
    } else if (link?.includes("bilibili")) {
      placeholderIcon = "i-tabler:brand-bilibili";
    } else if (link?.includes("nicovideo")) {
      placeholderIcon = "i-simple-icons:niconico";
    } else {
      placeholderIcon = "i-tabler:cast";
    }
  } else {
    if (placeholderType === "scheduled-yt-stream" && certainty === "likely") {
      placeholderIcon = "i-tabler:clock-question";
    } else if (placeholderType === "event" && certainty === "likely") {
      placeholderIcon = "i-tabler:calendar-question";
    } else {
      placeholderIcon = "i-tabler:calendar-event";
    }
  }

  return durationMs ?? status === "upcoming" ? (
    <span
      className={cn(
        "flex items-center justify-center gap-1 whitespace-nowrap rounded-sm bg-black/80 px-1 text-sm text-white/80 group-hover:text-white",
        { "bg-red-700/80": status === "live" },
        className,
      )}
    >
      {placeholderType && (
        <div
          className={
            placeholderIcon +
            (durationMs ? " text-base-11" : " my-1 text-lg text-base-9")
          }
        />
      )}
      {isPremiere
        ? t("component.videoCard.premiere")
        : durationMs && formatDuration(durationMs)}
    </span>
  ) : null;
}
