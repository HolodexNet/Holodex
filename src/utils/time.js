import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import relativeTime from "dayjs/plugin/relativeTime";
// import advancedFormat from "dayjs/plugin/advancedFormat";
import localizedFormat from "dayjs/plugin/localizedFormat";
import isTomorrow from "dayjs/plugin/isTomorrow";

dayjs.extend(localizedFormat);
dayjs.extend(isTomorrow);
// dayjs.extend(advancedFormat);
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

export function localizedDayjs(time, lang) {
    // eslint-disable-next-line no-param-reassign
    if (lang === "zh") lang = "zh-tw";
    // eslint-disable-next-line no-param-reassign
    if (lang === "pt") lang = "pt-br";
    return dayjs(time).locale(lang);
}

export function formatDistance(time, lang = "en", $t) {
    let diff;
    if (!time) return "?";
    if (Math.abs(dayjs().diff(time, "minutes")) < 1) return $t("time.soon");
    if (Math.abs(dayjs().diff(time, "days")) > 60) return localizedDayjs(time, lang).format("ll");
    if (Math.abs(dayjs().diff(time, "hour")) > 23)
        return `${localizedDayjs(time, lang).format("l")} (${localizedDayjs(time, lang).format("LT")})`;
    const timeObj = localizedDayjs(time, lang);
    if (new Date(time) > Date.now()) {
        diff = $t("time.diff_future_date", [
            timeObj.fromNow(),
            timeObj.format(`${timeObj.isTomorrow() ? "ddd " : ""}LT`),
        ]);
        return diff;
    }
    diff = $t("time.distance_past_date", [localizedDayjs(time, lang).fromNow()]);
    return diff;
}

export { dayjs };
