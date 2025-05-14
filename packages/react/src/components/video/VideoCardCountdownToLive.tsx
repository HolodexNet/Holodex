import { useState } from "react";
import { useAtomValue } from "jotai";
import { useTranslation } from "react-i18next";
import { formatCount } from "@/lib/numbers";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/shadcn/ui/tooltip";
import { localeAtom, preferredTimezonesAtom } from "@/store/i18n";
import { VideoCardType } from "./VideoCard";
import type { Dayjs } from "dayjs";
import React from "react";
import { cn } from "@/lib/utils";
import { useInterval } from "usehooks-ts";

interface LiveCounterProps {
  viewers?: number;
  start_date?: string;
  className?: string;
}

const LiveCounter = React.memo(
  ({ viewers, className, start_date }: LiveCounterProps) => {
    const { t } = useTranslation();

    return (
      <div className={cn("flex gap-1 text-base-11", className)}>
        {start_date || viewers ? (
          <span className="text-red-500">
            {t("component.videoCard.liveNow")}
          </span>
        ) : (
          <span className="capitalize text-secondary-10">{t("time.soon")}</span>
        )}
        {start_date && viewers && viewers > 0 ? (
          <>
            <span>/</span>
            <span>
              {t("component.videoCard.watching", {
                0: formatCount(viewers),
              })}
            </span>
          </>
        ) : null}
      </div>
    );
  },
);

interface TimeTooltipProps {
  id: string;
  timestamp: string | Date | number | Dayjs;
  isLikely?: boolean;
  children: React.ReactNode;
  className?: string;
}

const TimeTooltip = ({
  id,
  timestamp,
  isLikely,
  children,
  className,
}: TimeTooltipProps) => {
  const preferredTimezones = useAtomValue(preferredTimezonesAtom);

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span
          className={cn(
            "text-base-11",
            isLikely && "italic hover:animate-pulse",
            className,
          )}
        >
          {children}
        </span>
      </TooltipTrigger>
      <TooltipContent className="bg-base-3 p-1.5">
        <WorldTimeTooltip
          id={id}
          timestamp={timestamp}
          isLikely={isLikely}
          preferredTimezones={preferredTimezones}
        />
      </TooltipContent>
    </Tooltip>
  );
};

export function VideoCardCountdownToLive({
  video,
  className,
  onlyTime = false,
}: {
  className?: string;
  video: VideoCardType;
  onlyTime?: boolean; // Only show time info, basically pretending it's a available_at only.
}) {
  const { t } = useTranslation();
  const { dayjs } = useAtomValue(localeAtom);
  const [, setTime] = useState(Date.now());

  // Update time every 30 seconds
  useInterval(() => setTime(Date.now()), 30000);

  // Early return for live videos
  if (video.status === "live" && !onlyTime) {
    return (
      <LiveCounter
        viewers={video.live_viewers}
        start_date={video.start_actual}
        className={className}
      />
    );
  }

  // Handle upcoming videos
  if (
    (video.type === "placeholder" || video.status === "upcoming") &&
    video.start_scheduled &&
    !onlyTime
  ) {
    const tick = dayjs(video.start_scheduled);
    const countdownText = t("time.diff_future_date", {
      0: tick.fromNow(false) + (video.certainty === "likely" ? "??" : ""),
      1: tick.format("hh:mm A"),
    });

    return (
      <TimeTooltip
        id={video.id}
        timestamp={tick}
        isLikely={video.certainty === "likely"}
        className={className}
      >
        {countdownText}
      </TimeTooltip>
    );
  }

  // Handle past videos
  if (onlyTime || (video.status === "past" && video.available_at)) {
    const tick = dayjs(video.available_at);
    const pastText = t("time.distance_past_date", {
      0: tick.fromNow(false),
    });

    return (
      <TimeTooltip id={video.id} timestamp={tick} className={className}>
        {pastText}
      </TimeTooltip>
    );
  }

  // Handle missing videos
  if (video.status === "missing") {
    if (video.start_actual || video.start_scheduled || video.available_at) {
      const tick = dayjs(
        video.start_actual || video.start_scheduled || video.available_at,
      );
      return (
        <TimeTooltip id={video.id} timestamp={tick} className={className}>
          <div className="inline-block align-text-bottom opacity-80 i-ph:image-broken" />
          &nbsp;{tick.format("LLL")}
        </TimeTooltip>
      );
    }
  }

  return null;
}

// Custom hook for interval
const WorldTimeTooltip = React.memo(
  ({
    id,
    timestamp,
    isLikely,
    preferredTimezones,
  }: {
    id: string;
    timestamp: string | Date | number | Dayjs;
    isLikely?: boolean;
    preferredTimezones: string[];
  }) => {
    const { dayjs } = useAtomValue(localeAtom);
    const { t } = useTranslation();

    const formatTimeForTimezones = (timestamp: Parameters<typeof dayjs>[0]) => {
      const djs = dayjs(timestamp);
      return preferredTimezones.map((tz) => ({
        timezone: tz,
        time: djs.tz(tz).format("MMM DD LT"),
        day: djs.tz(tz).format("ddd"),
      }));
    };

    const times = formatTimeForTimezones(timestamp);

    return (
      <div className="w-64">
        {isLikely && (
          <div className="rounded-md p-2 text-xs mb-3 bg-yellow-500/10 text-yellow-10">
            {t("component.videoCard.uncertainPlaceholder")}
          </div>
        )}

        <div className="space-y-1">
          {times.map(({ timezone, time, day }) => {
            // Extract meaningful parts from timezone for display
            const cityName = timezone.split("/").pop()?.replace("_", " ");

            return (
              <div
                key={`${id}_${timezone}`}
                className="flex items-center justify-between rounded-sm hover:bg-base-4"
              >
                <div className="flex flex-col">
                  <span className="text-sm font-medium text-base-12">
                    {cityName}
                  </span>
                  <span className="text-xs text-base-10">{day}</span>
                </div>
                <div className="font-mono text-sm text-base-11 font-extrabold antialiased">
                  {time}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  },
);
