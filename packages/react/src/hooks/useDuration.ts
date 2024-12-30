import { useSeconds } from "use-seconds";

export function useDuration({
  type,
  status,
  duration,
  end_actual,
  start_actual,
}: Pick<
  Video,
  "type" | "status" | "duration" | "end_actual" | "start_actual"
>) {
  const [date] = useSeconds();

  if (status === "missing") return duration ? duration * 1000 : null;

  if (status === "past") return duration * 1000;

  if (status === "live" && start_actual)
    return (
      new Date(end_actual ?? Date.now()).valueOf() -
      new Date(start_actual).valueOf()
    );

  const durationMs =
    (type === "stream" && duration * 1000) ||
    (end_actual && start_actual
      ? new Date(end_actual).valueOf() - new Date(start_actual).valueOf()
      : start_actual
        ? date.valueOf() - new Date(start_actual).valueOf()
        : null);

  return durationMs;
}
