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

export function compareTimeDiffToNow(timeString: string | undefined) {
  if (!timeString) return "";
  const diff = new Date(timeString).getTime() - new Date().getTime();
  const absDiff = Math.abs(diff);
  const seconds = Math.floor(absDiff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours < 1) {
    return `${minutes}m`;
  }
  return `${hours}h`;
}
