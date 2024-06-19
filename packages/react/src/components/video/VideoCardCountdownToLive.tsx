import React, { useEffect, useState } from "react";
import { formatCount, formatDuration } from "@/lib/time";
import type { VideoCardType } from "./VideoCard";
import { useTranslation } from "react-i18next";
import { localeAtom } from "@/store/i18n";
import { useAtomValue } from "jotai";

export function VideoCardCountdownToLive({
  video,
}: {
  className?: string;
  video: VideoCardType;
}) {
  const { dayjs } = useAtomValue(localeAtom);
  const { t } = useTranslation();
  const [, setTime] = useState(Date.now());

  useEffect(() => {
    const interval = setInterval(() => setTime(Date.now()), 30000);
    return () => {
      clearInterval(interval);
    };
  }, []);

  if (video.status === "live") {
    return (
      <div className="flex gap-1 text-base-11">
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
    // video.status !== "live" &&
    video.start_scheduled
  ) {
    return (
      <span className="text-base-11">
        {t("time.diff_future_date", {
          0: dayjs(video.start_scheduled).fromNow(false),
          1: dayjs(video.start_scheduled).format("hh:mm A"),
        })}
      </span>
    );
  }

  if (video.status === "past" && video.available_at) {
    return (
      <span className="text-base-11">
        {t("time.distance_past_date", {
          0: dayjs(video.available_at).fromNow(false),
        })}
      </span>
    );
  }
}
