import dayjs from "dayjs";

// eslint-disable-next-line import/prefer-default-export
export function formatFromNowHM(time) {
    const timeInMin = Math.floor(dayjs(time).diff(dayjs()) / 60000);
    const hours = Math.floor(timeInMin / 60);
    const mins = timeInMin % 60;

    if (timeInMin <= 1) return "soon!";
    if (timeInMin < 60) return `in ${mins} minutes`;
    if (timeInMin === 60) return "in 1 hour";
    if (timeInMin % 60 === 0) return `in ${hours} hours`;
    return `in ${hours} hours and ${mins} minutes`;
}
