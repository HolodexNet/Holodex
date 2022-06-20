export function tlClientTimeFormat(timeRaw: number): string {
  let timeString = "";

  let t = Math.floor(timeRaw / 60 / 60 / 1000);
  timeRaw -= t * 60 * 60 * 1000;
  if (t < 10) {
    timeString += `0${t.toString()}`;
  } else {
    timeString += t.toString();
  }
  timeString += ":";

  t = Math.floor(timeRaw / 60 / 1000);
  timeRaw -= t * 60 * 1000;
  if (t < 10) {
    timeString += `0${t.toString()}`;
  } else {
    timeString += t.toString();
  }
  timeString += ":";

  t = Math.floor(timeRaw / 1000);
  timeRaw -= t * 1000;
  if (t < 10) {
    timeString += `0${t.toString()}`;
  } else {
    timeString += t.toString();
  }
  timeString += ".";

  if (timeRaw > 100) {
    timeString += timeRaw.toString().slice(0, 2);
  } else if (timeRaw > 10) {
    timeString += `0${timeRaw.toString().slice(0, 1)}`;
  } else {
    timeString += "00";
  }
  return timeString;
}
