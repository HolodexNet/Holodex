import { useDuration } from "@/hooks/useDuration";
import { formatDuration } from "@/lib/time";
import { formatCount } from "@/lib/numbers";
import { cn } from "@/lib/utils";
import { Badge } from "@/shadcn/ui/badge";
import { localeAtom } from "@/store/i18n";
import { useAtomValue } from "jotai";
import { useTranslation } from "react-i18next";

export function VideoStats({
  type,
  status,
  topic_id,
  end_actual,
  start_actual,
  duration,
  live_viewers,
  available_at,
}: Pick<
  Video,
  | "id"
  | "type"
  | "status"
  | "topic_id"
  | "start_actual"
  | "end_actual"
  | "duration"
  | "live_viewers"
  | "available_at"
>) {
  const { dayjs } = useAtomValue(localeAtom);
  const { t } = useTranslation();
  const durationMs = useDuration({
    type,
    status,
    start_actual,
    end_actual,
    duration,
  });

  return (
    <div className="flex items-center gap-1 text-sm text-base-11">
      {topic_id && (
        <Badge variant="outline" className="mr-2 capitalize">
          {topic_id}
        </Badge>
      )}
      <span className={cn("font-bold", { "text-red": status === "live" })}>
        {formatDuration(durationMs ?? 0)}
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
      {status === "past" && (
        <>
          <span>/</span>
          <span>{dayjs(start_actual ?? available_at).format("L LT")}</span>
        </>
      )}
    </div>
  );
}
