import { useState, useEffect, useCallback } from "react";
import { useAtomValue } from "jotai";
import { useTranslation } from "react-i18next";
import { formatCount } from "@/lib/numbers";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/shadcn/ui/tooltip";
import { localeAtom, preferredTimezonesAtom } from "@/store/i18n";
import { VideoCardType } from "./VideoCard";
import type { Dayjs } from "dayjs";

let incr = 0;

export function VideoCardCountdownToLive({
  video,
  className,
}: {
  className?: string;
  video: VideoCardType;
}) {
  const { dayjs } = useAtomValue(localeAtom);
  const { t } = useTranslation();
  const [, setTime] = useState(Date.now());
  const preferredTimezones = useAtomValue(preferredTimezonesAtom);

  useEffect(() => {
    const interval = setInterval(() => setTime(Date.now()), 30000);
    return () => {
      clearInterval(interval);
    };
  }, []);

  const renderTooltipContent = useCallback(
    (id: string, timestamp: string | Date | number | Dayjs) => {
      const formatTimeForTimezones = (
        timestamp: Parameters<typeof dayjs>[0],
      ) => {
        const djs = dayjs(timestamp);
        return preferredTimezones.map((tz) => ({
          timezone: tz,
          time: djs.tz(tz).format("MM/DD LT"),
        }));
      };

      return (
        <div className="flex flex-col items-stretch gap-1">
          {video.certainty === "likely" && (
            <span className="mb-2 block max-w-48 text-xs text-yellow-10">
              {t("component.videoCard.uncertainPlaceholder")}
            </span>
          )}
          {formatTimeForTimezones(timestamp).map(({ timezone, time }) => (
            <div key={id + timezone + incr++} className="">
              <div className="text-base-9">{timezone}:</div>
              <div className="text-center text-sm font-semibold text-base-11">
                {time}
              </div>
            </div>
          ))}
        </div>
      );
    },
    [dayjs, preferredTimezones, t, video.certainty],
  );

  if (video.status === "live") {
    return (
      <div className={`flex gap-1 text-base-11 ${className}`}>
        <span className="text-red-500">{t("component.videoCard.liveNow")}</span>
        {!!video.live_viewers && (
          <>
            <span>/</span>
            <span>
              {t("component.videoCard.watching", {
                0: formatCount(video.live_viewers),
              })}
            </span>
          </>
        )}
      </div>
    );
  }

  if (
    (video.type === "placeholder" || video.status === "upcoming") &&
    video.start_scheduled
  ) {
    const tick = dayjs(video.start_scheduled);
    const countdownText = t("time.diff_future_date", {
      0: (
        <span className={video.certainty === "likely" ? "italic" : ""}>
          {tick.fromNow(false) + (video.certainty === "likely" ? "?" : "")}
        </span>
      ),
      1: tick.format("hh:mm A"),
    });

    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <span className={`text-base-11 ${className}`}>{countdownText}</span>
        </TooltipTrigger>
        <TooltipContent className="bg-base-3 p-1.5">
          {renderTooltipContent(video.id, tick)}
        </TooltipContent>
      </Tooltip>
    );
  }

  if (video.status === "past" && video.available_at) {
    const tick = dayjs(video.start_scheduled);

    const pastText = t("time.distance_past_date", {
      0: tick.fromNow(false),
    });

    return (
      <Tooltip>
        <TooltipTrigger asChild>
          <span className={`text-base-11 ${className}`}>{pastText}</span>
        </TooltipTrigger>
        <TooltipContent className="bg-base-3 p-1.5" avoidCollisions>
          {renderTooltipContent(video.id, tick)}
        </TooltipContent>
      </Tooltip>
    );
  }

  return null;
}
