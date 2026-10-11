import { Link } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import {
  BookmarkIcon,
  HeartIcon,
  HeartFilledIcon,
  MultiviewIcon,
  PlayIcon,
  UsersIcon,
  ClockIcon,
  CheckIcon,
} from "@/components/icons";
import { Avatar, IconButton } from "./common";
import { isPlayable } from "@/lib/api";
import { channelName, usePreferences } from "@/lib/preferences";
import type { Video } from "@/lib/types";
import { cn } from "@/lib/utils";

export function videoDate(video: Video) {
  const value = video.start_scheduled || video.available_at;
  return value ? new Date(value) : undefined;
}
export function timeLabel(video: Video, hour12: boolean) {
  const date = videoDate(video);
  if (!date || Number.isNaN(date.getTime())) return "Time to be announced";
  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12,
  });
}
function duration(seconds: number) {
  const h = Math.floor(seconds / 3600);
  return `${h ? `${h}:` : ""}${String(Math.floor((seconds % 3600) / 60)).padStart(h ? 2 : 1, "0")}:${String(seconds % 60).padStart(2, "0")}`;
}
export function VideoCard({
  video,
  list = false,
}: {
  video: Video;
  list?: boolean;
}) {
  const {
    prefs,
    favorites,
    toggleFavorite,
    saved,
    toggleSaved,
    queue,
    toggleQueue,
  } = usePreferences();
  const favorite = favorites.some((c) => c.id === video.channel.id);
  const bookmarked = saved.some((v) => v.id === video.id);
  const queued = queue.some((v) => v.id === video.id);
  const name = channelName(video.channel, prefs.englishNames);
  return (
    <article
      className={cn("video-card group min-w-0", list && "video-card-list")}
    >
      <Link
        to={`/watch/${encodeURIComponent(video.id)}`}
        className="thumbnail relative block aspect-video overflow-hidden rounded-xl bg-muted"
        aria-label={`Watch ${video.title || name}`}
      >
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-muted-foreground">
          <PlayIcon className="size-8" />
          <span className="text-xs">
            {video.type.includes("placeholder") ? "Scheduled event" : name}
          </span>
        </div>
        {isPlayable(video) && (
          <img
            src={`https://i.ytimg.com/vi/${video.id}/hqdefault.jpg`}
            alt=""
            className="absolute inset-0 size-full object-cover transition-transform duration-300 group-hover:scale-[1.025]"
            loading="lazy"
            onError={(e) => {
              e.currentTarget.hidden = true;
            }}
          />
        )}
        <div className="absolute bottom-0 inset-x-0 h-16 bg-linear-to-t from-black/55 to-transparent" />
        {video.status === "live" ? (
          <span className="absolute bottom-2.5 left-2.5 inline-flex items-center gap-1.5 rounded-md bg-[#ec507a] px-2 py-1 text-[10px] font-bold tracking-wide text-white">
            <span className="size-1.5 rounded-full bg-white" />
            LIVE
          </span>
        ) : video.status === "upcoming" ? (
          <span className="absolute bottom-2.5 left-2.5 rounded-md bg-black/65 px-2 py-1 text-[10px] font-medium text-white">
            UPCOMING
          </span>
        ) : null}
        {video.status === "live" && Number(video.live_viewers) > 0 && (
          <span className="absolute right-2.5 bottom-2.5 flex items-center gap-1 rounded-md bg-black/65 px-2 py-1 text-[11px] text-white">
            <UsersIcon className="size-3" />
            {Number(video.live_viewers).toLocaleString()}
          </span>
        )}
        {video.status === "past" && !!video.duration && (
          <span className="absolute bottom-2.5 right-2.5 rounded bg-black/70 px-1.5 py-.5 text-[11px] text-white">
            {duration(video.duration)}
          </span>
        )}
      </Link>
      <div className="card-details min-w-0 pt-3">
        <div className="flex gap-2.5">
          <Avatar channel={video.channel} className="mt-.5 size-8" />
          <div className="min-w-0 flex-1">
            <Link
              to={`/watch/${encodeURIComponent(video.id)}`}
              className="line-clamp-2 text-[13px] font-semibold leading-[1.6] hover:text-primary-ink"
              title={video.title || name}
            >
              {video.title || "Untitled stream"}
            </Link>
            <div className="mt-1 flex items-center gap-1.5">
              <Link
                to={`/search?channel=${encodeURIComponent(video.channel.id)}&name=${encodeURIComponent(name)}`}
                className="truncate text-xs text-muted-foreground hover:text-foreground"
              >
                {name}
              </Link>
              <IconButton
                label={favorite ? `Unfavorite ${name}` : `Favorite ${name}`}
                size="icon-xs"
                className={cn("size-5", favorite && "text-primary-ink")}
                onClick={() => toggleFavorite(video.channel)}
              >
                {favorite ? <HeartFilledIcon /> : <HeartIcon />}
              </IconButton>
            </div>
          </div>
        </div>
        <div className="mt-2.5 flex items-center justify-between gap-1 pl-[42px]">
          {video.status === "upcoming" ? (
            <span className="flex min-w-0 items-center gap-1 text-[11px] text-muted-foreground">
              <ClockIcon className="size-3 shrink-0" />
              {timeLabel(video, prefs.hour12)}
            </span>
          ) : (
            <Badge
              variant="secondary"
              className="max-w-[75%] truncate rounded-md px-1.5 py-.5 text-[10px] font-normal"
            >
              {(
                video.topic_id || (video.type === "clip" ? "Clip" : "Stream")
              ).replaceAll("_", " ")}
            </Badge>
          )}
          <div className="flex shrink-0 items-center">
            <IconButton
              label={
                bookmarked ? "Remove from watch later" : "Save to watch later"
              }
              size="icon-xs"
              className={cn("size-6", bookmarked && "text-primary-ink")}
              onClick={() => toggleSaved(video)}
            >
              {bookmarked ? <CheckIcon /> : <BookmarkIcon />}
            </IconButton>
            {isPlayable(video) && (
              <IconButton
                label={
                  queued
                    ? "Remove from multiview"
                    : queue.length >= 4
                      ? "Multiview is full (4 streams)"
                      : "Add to multiview"
                }
                size="icon-xs"
                disabled={!queued && queue.length >= 4}
                className={cn("size-6", queued && "text-primary-ink")}
                onClick={() => toggleQueue(video)}
              >
                {queued ? <CheckIcon /> : <MultiviewIcon />}
              </IconButton>
            )}
          </div>
        </div>
      </div>
    </article>
  );
}
