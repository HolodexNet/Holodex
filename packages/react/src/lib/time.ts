export function formatDuration(millisecs: number) {
  const seconds = millisecs / 1000;
  const s = Math.abs(millisecs / 1000);

  const t = [0, 0, 0];
  let r = s % 3600;

  t[0] = Math.floor(s / 3600);
  t[1] = Math.floor(r / 60);
  r = r % 60;
  t[2] = Math.floor(r);

  return `${seconds < 0 ? "-" : ""}${
    t[0] > 0 ? String(t[0]).padStart(2, "0") + ":" : ""
  }${String(t[1]).padStart(2, "0")}:${String(t[2]).padStart(2, "0")}`;
}
