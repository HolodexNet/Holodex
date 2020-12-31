import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import relativeTime from "dayjs/plugin/relativeTime";
import advancedFormat from "dayjs/plugin/advancedFormat";

dayjs.extend(advancedFormat);
const thresholds = [
    { l: "s", r: 1 },
    { l: "m", r: 1 },
    { l: "mm", r: 59, d: "minute" },
    { l: "h", r: 1 },
    { l: "hh", r: 23, d: "hour" },
    { l: "d", r: 1 },
    { l: "dd", r: 29, d: "day" },
    { l: "M", r: 1 },
    { l: "MM", r: 11, d: "month" },
    { l: "y" },
    { l: "yy", d: "year" },
];
dayjs.extend(relativeTime, {
    thresholds,
});
dayjs.extend(utc);

export function formatDuration(secs) {
    return secs > 60 * 60 * 1000 ? dayjs.utc(secs).format("H:mm:ss") : dayjs.utc(secs).format("m:ss");
}

export function formatStreamStart(time) {
    const diff = dayjs(time).diff(dayjs());
    if (diff > 24 * 60 * 60 * 1000) return dayjs(this.video.live_schedule).format("ddd MMM Do, h:mm a");
    if (diff < 1000) return "soon";
    // might need to replace this with locale string
    return dayjs.utc(diff).format(`[in ]${diff > 60 * 60 * 1000 ? "H[ hour and ]" : ""}m[ minutes]`);
}

export { dayjs };
