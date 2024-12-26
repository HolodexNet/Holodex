export function formatDuration(millisecs: number): string {
  const absSeconds = Math.abs(millisecs) / 1000;

  const hours = Math.floor(absSeconds / 3600);
  const minutes = Math.floor((absSeconds % 3600) / 60);
  const seconds = Math.floor(absSeconds % 60);

  const formattedTime = [
    hours > 0 ? String(hours).padStart(2, "0") : null,
    String(minutes).padStart(2, "0"),
    String(seconds).padStart(2, "0"),
  ]
    .filter(Boolean)
    .join(":");

  return millisecs < 0 ? `-${formattedTime}` : formattedTime;
}
