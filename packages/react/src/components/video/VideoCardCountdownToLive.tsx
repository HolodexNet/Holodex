import React, { useState, useEffect } from "react";
import { useAtomValue } from "jotai";
import { useTranslation } from "react-i18next";
import { formatCount } from "@/lib/time";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/shadcn/ui/tooltip";
import { localeAtom, preferredTimezonesAtom } from "@/store/i18n";
import { VideoCardType } from "./VideoCard";

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

  const formatTimeForTimezones = (timestamp: Parameters<typeof dayjs>[0]) => {
    return preferredTimezones.map((tz) => ({
      timezone: tz,
      time: dayjs(timestamp).tz(tz).format("MM/DD LT"),
    }));
  };

  const renderTooltipContent = (timestamp: Parameters<typeof dayjs>[0]) => (
    <div className="grid grid-cols-2 gap-x-4">
      {video.certainty === "likely" && (
        <span className="col-span-2 mb-2 max-w-56 text-yellow-10">
          {t("component.videoCard.uncertainPlaceholder")}
        </span>
      )}
      <div className="space-y-1">
        {formatTimeForTimezones(timestamp).map(({ timezone }) => (
          <div key={timezone} className="text-right font-semibold">
            {timezone}:
          </div>
        ))}
      </div>
      <div className="space-y-1">
        {formatTimeForTimezones(timestamp).map(({ timezone, time }) => (
          <div key={timezone}>{time}</div>
        ))}
      </div>
    </div>
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
    const countdownText = t("time.diff_future_date", {
      0: (
        <span className={video.certainty === "likely" ? "italic" : ""}>
          {dayjs(video.start_scheduled).fromNow(false) +
            (video.certainty === "likely" ? "?" : "")}
        </span>
      ),
      1: dayjs(video.start_scheduled).format("hh:mm A"),
    });

    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className={`text-base-11 ${className}`}>{countdownText}</span>
          </TooltipTrigger>
          <TooltipContent>
            {renderTooltipContent(video.start_scheduled)}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  if (video.status === "past" && video.available_at) {
    const pastText = t("time.distance_past_date", {
      0: dayjs(video.available_at).fromNow(false),
    });

    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className={`text-base-11 ${className}`}>{pastText}</span>
          </TooltipTrigger>
          <TooltipContent>
            {renderTooltipContent(video.available_at)}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  return null;
}
