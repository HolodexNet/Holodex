import { VideoCardCountdownToLive } from "./VideoCardCountdownToLive";
import { formatDuration } from "@/lib/time";
import { Button } from "@/shadcn/ui/button";
import { Link } from "react-router-dom";
import { VideoMenu } from "./VideoMenu";
import { cn, makeThumbnailUrl, resizeChannelPhoto } from "@/lib/utils";
import React, { Suspense, useCallback, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useDuration } from "@/hooks/useDuration";
import { VideoThumbnail } from "./VideoThumbnail";
import { usePreferredName } from "@/store/settings";
import { useAtomValue, useSetAtom } from "jotai";
import {
  selectedVideoSetReadonlyAtom,
  useVideoSelection,
} from "@/hooks/useVideoSelection";
import { isMobileAtom, openSidebarAtom } from "@/hooks/useFrame";
import { ChannelImg } from "../channel/ChannelImg";
import { tldexLanguageAtom } from "@/store/tldex";
import { useDefaultVideoCardClickHandler } from "./VideoCard.utils";
import { useLongPress } from "react-use";

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
  // showing the status of the video object (live now, # watching, or available_at time)
  showStatus?: boolean | "available_at_only";
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
  showStatus = true,
}: VideoCardProps) {
  const isTwitchPlaceholder = video.link?.includes("twitch");
  const videoHref =
    !isTwitchPlaceholder && video.status === "live" && video.link
      ? video.link
      : `/watch/${video.id}`;
  const videoIsPlaceholder = video.type === "placeholder";
  const thumbnailSrc = makeThumbnailUrl(video.id, size, video.thumbnail);

  const externalLink = videoIsPlaceholder
    ? video.link
    : `https://youtu.be/${video.id}`;

  const videoTarget =
    !isTwitchPlaceholder && video.placeholderType === "external-stream"
      ? "_blank"
      : undefined;

  const [placeholderOpen, setPlaceholderOpen] = useState(false); // placeholder popup state.

  const selectedSet = useAtomValue(selectedVideoSetReadonlyAtom);
  const { selectionMode, setSelectionMode, addVideo } = useVideoSelection();
  const isMobile = useAtomValue(isMobileAtom);

  const goToVideoClickHandler = useDefaultVideoCardClickHandler(
    video,
    setPlaceholderOpen,
  );

  const longPressCallback = useCallback(() => {
    setSelectionMode(true);
    // i would add the video here but i think if you don't move your mouse it counts as a click
    // and i can't stop propagation coz it's usually another layer that's being clicked.
  }, [setSelectionMode]);
  const longPressBind = useLongPress(longPressCallback, {
    isPreventDefault: false,
    delay: 1500,
  });
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
      outerLayer: cn([
        "opacity-100 transition-opacity duration-300 starting:opacity-0",
        size == "list" && "rounded-sm hover:bg-base-3 @lg:px-2",
        (size == "list" || size == "sm") &&
          "group relative flex gap-2 py-2 @lg:gap-4",
        (size == "md" || size == "lg") && "group flex w-full flex-col gap-4",
        onClick && "cursor-pointer",
        selectionMode &&
          (selectedSet?.has(video.id)
            ? "rounded-lg ring-4 ring-primary-8 ring-offset-2 ring-offset-base-2 "
            : "rounded-lg opacity-50 ring-4 ring-base-6 ring-offset-2 ring-offset-base-2 brightness-75 saturate-[0.75]"),
      ]),
      thumbnailLink: cn([
        size == "list" &&
          "relative aspect-video w-28 shrink-0 overflow-hidden @lg:w-36",
        size == "sm" && "relative w-36 shrink-0 overflow-hidden @lg:w-48",
        (size == "md" || size == "lg") && "relative w-full",
      ]),
      videoTextInfo: cn([
        (size == "list" || size == "sm") && "flex flex-col gap-1",
        (size == "md" || size == "lg") &&
          "flex min-h-[6rem] cursor-pointer flex-col gap-0",
      ]),
      titleLink: cn([
        (size == "list" || size == "sm") &&
          "line-clamp-2 pr-4 text-sm font-bold @lg:text-lg",
        (size == "md" || size == "lg") &&
          "line-clamp-2 pr-4 text-sm font-bold md:text-[1rem] md:leading-6",
      ]),
      channelLink:
        "line-clamp-1 text-sm text-primary-11 hover:text-primary-12 @lg:text-sm",
      scheduleText: "text-sm @lg:text-sm text-base-11",
    }),
    [size, onClick, selectionMode, selectedSet, video.id],
  );
  const swipeRightX = useRef<number | null>(null);
  const swipeRightY = useRef<number | null>(null);
  const openSidebar = useSetAtom(openSidebarAtom);

  const tlLang = useAtomValue(tldexLanguageAtom);
  const tlcount = video.live_tl_count?.[tlLang] ?? 0;

  const chName = usePreferredName(video.channel);

  const handleSwipeRightStart = (e: React.TouchEvent<HTMLDivElement>) => {
    // Check if the touch starts near the left edge of the screen
    const SWIPE_RIGHT_START_POINT = 30;
    if (e.touches[0].clientX <= SWIPE_RIGHT_START_POINT) {
      swipeRightX.current = e.touches[0].clientX;
      swipeRightY.current = e.touches[0].clientY;
    } else {
      swipeRightX.current = null;
      swipeRightY.current = null;
    }
  };
  const handleSwipeRightMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (swipeRightX.current === null || swipeRightY.current === null) return;

    const touchEndX = e.touches[0].clientX;
    const touchEndY = e.touches[0].clientY;

    const deltaX = touchEndX - swipeRightX.current;
    const deltaY = touchEndY - swipeRightY.current;

    const SWIPE_RIGHT_THRESHOLD = 100;

    // Check if the movement is primarily horizontal and to the right
    if (Math.abs(deltaX) > Math.abs(deltaY) && deltaX > SWIPE_RIGHT_THRESHOLD) {
      openSidebar();
      swipeRightX.current = null;
      swipeRightY.current = null;
    }
  };
  const handleSwipeRightEnd = () => {
    swipeRightX.current = null;
    swipeRightY.current = null;
  };

  return (
    <div
      className={videoCardClasses.outerLayer}
      onClick={(e) =>
        onClick ? onClick("full", video, e) : goToVideoClickHandler(e)
      }
      onTouchStart={(e) => {
        longPressBind.onTouchStart(e);
        handleSwipeRightStart(e);
      }}
      onTouchMove={(e) => {
        handleSwipeRightMove(e);
      }}
      onTouchEnd={() => {
        longPressBind.onTouchEnd();
        handleSwipeRightEnd();
      }}
      onMouseUp={() => {
        longPressBind.onMouseUp();
      }}
      onMouseDown={(e) => {
        longPressBind.onMouseDown(e);
      }}
      onMouseLeave={() => {
        longPressBind.onMouseLeave();
      }}
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
            (videoIsPlaceholder &&
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
                className="i-fluent:music-note-2-16-regular inline-block align-text-bottom"
                // style={{ fontSize: "13px", lineHeight: "1.15rem" }}
              />
              &nbsp;{video.songcount}
            </span>
          )}
          {tlcount > 0 && (
            <span className="text-pretty rounded-sm bg-black/80 px-1 text-sm capitalize text-white/80 group-hover:text-white">
              <div
                className="i-fluent:subtitles-16-regular inline-block align-text-bottom"
                // style={{ fontSize: "13px", lineHeight: "1.15rem" }}
              />
              &nbsp;{tlcount}
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
            databehavior="channelLink"
            className="shrink-0"
            onClick={(e) =>
              onClick ? onClick("channel", video, e) : goToVideoClickHandler(e)
            }
          >
            <ChannelImg
              channelId={video.channel.id}
              size={64}
              fallbackPhoto={
                video.channel.photo
                  ? resizeChannelPhoto(video.channel.photo, 240)
                  : undefined
              }
              className="h-8 w-8 rounded-full"
            />
          </Link>
        )}

        {/* This sub-block contains the Video Text Info: Title, Channel, Schedule. */}
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
              databehavior="channelLink"
              to={`/channel/${video.channel.id}`}
              onClick={(e) => onClick && onClick("channel", video, e)}
            >
              {chName}
            </Link>
          )}
          {size != "xs" && showStatus && (
            <div className={videoCardClasses.scheduleText}>
              <VideoCardCountdownToLive
                video={video}
                onlyTime={showStatus === "available_at_only"}
              />
            </div>
          )}
        </div>
        {/* The last sub-block is for the video menu dropdown */}
        <VideoMenu url={externalLink} video={video}>
          <Button
            variant="ghost"
            size="icon-lg"
            className={cn("absolute right-0 top-0 h-8 w-6 rounded-sm", {
              "opacity-100": isMobile,
              "opacity-0 group-hover:opacity-100": !isMobile,
            })}
            onClickCapture={(e) => {
              e.preventDefault();
              e.stopPropagation();
            }}
          >
            <div className="i-heroicons:ellipsis-vertical h-6 w-6" />
          </Button>
        </VideoMenu>
        {videoIsPlaceholder && (
          // This block contains the pop-up card for the video which is rendered when clicked.
          // the surrounding onclick and mousedown events are caught to prevent navigating the video.
          <div onClick={stopPropagation} onMouseDown={stopPropagation}>
            <Suspense fallback={null}>
              {/* The `Suspense` prevents the lazy-loaded placeholder from blocking page rendering */}
              <LazyVideoCardPlaceholder
                open={placeholderOpen}
                setOpen={setPlaceholderOpen}
                video={video}
              />
            </Suspense>
          </div>
        )}
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
