import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import relativeTime from "dayjs/plugin/relativeTime";
import timezone from "dayjs/plugin/timezone";
import advancedFormat from "dayjs/plugin/advancedFormat";
import localizedFormat from "dayjs/plugin/localizedFormat";
import isTomorrow from "dayjs/plugin/isTomorrow";

dayjs.extend(localizedFormat);
dayjs.extend(isTomorrow);
dayjs.extend(advancedFormat);
dayjs.extend(utc);
dayjs.extend(timezone);

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

export function formatDuration(millisecs) {
    const negate = millisecs < 0;
    const timestamp = millisecs > 60 * 60 * 1000 ? dayjs.utc(Math.abs(millisecs)).format("H:mm:ss") : dayjs.utc(Math.abs(millisecs)).format("m:ss");
    return `${negate ? "-" : ""}${timestamp}`;
}

// eslint-disable-next-line no-unused-vars
export function localizedDayjs(time, lang) {
    // const dayjsName = {
    //     "en-CA": "en-ca",
    //     "en-GB": "en-gb",
    //     zh: "zh-tw",
    //     "es-ES": "es",
    //     "pt": "pt-br",
    // }
    // // eslint-disable-next-line no-param-reassign
    // lang = dayjsName[lang] || lang;
    return dayjs(time);
}
export function formatDistance(time, lang, $t, allowNegative = true, now = dayjs()) {
    let diff;
    if (!time) return "?";
    const minutesdiff = now.diff(time, "minutes");
    if (Math.abs(minutesdiff) < 1) return $t("time.soon");
    if (!allowNegative && minutesdiff > 0) return $t("time.soon");
    if (Math.abs(now.diff(time, "days")) > 60) return localizedDayjs(time, lang).format("ll");
    if (Math.abs(now.diff(time, "hour")) > 23) {
        return `${localizedDayjs(time, lang).format("l")} (${localizedDayjs(time, lang).format("LT")})`;
    }
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

export function secondsToHuman(s) {
    // console.log(s);
    return new Date(s * 1000).toISOString().substr(11, 8);
}

export { dayjs };
