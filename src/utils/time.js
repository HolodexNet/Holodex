import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import relativeTime from "dayjs/plugin/relativeTime";
import advancedFormat from "dayjs/plugin/advancedFormat";

dayjs.extend(advancedFormat);
dayjs.extend(utc);
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

export function formatDuration(secs) {
    return secs > 60 * 60 * 1000 ? dayjs.utc(secs).format("H:mm:ss") : dayjs.utc(secs).format("m:ss");
}

export function formatDistance(time, lang = "en", $t) {
    let diff;
    if (Math.abs(dayjs().diff(time, "minutes")) < 1) return $t("time.soon");
    if (new Date(time) > Date.now()) {
        diff = $t("time.diff_future_date", [
            dayjs(time).locale(lang).fromNow(),
            dayjs(time).locale(lang).format("hh:mm"),
        ]);
        return diff;
    }
    if (Math.abs(dayjs().diff(time, "hour")) > 23) return dayjs(time).locale(lang).format("ddd MMM Do, hh:mm");
    diff = $t("time.distance_past_date", [
        dayjs(time).locale(lang).fromNow(),
        dayjs(time).locale(lang).format("hh:mm"),
    ]);
    return diff;
}

export { dayjs };
