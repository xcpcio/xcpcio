import dayjs from "dayjs";

import duration from "dayjs/plugin/duration";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import advancedFormat from "dayjs/plugin/advancedFormat";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import minMax from "dayjs/plugin/minMax";
import relativeTime from "dayjs/plugin/relativeTime";

dayjs.extend(duration);
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(advancedFormat);
dayjs.extend(isSameOrBefore);
dayjs.extend(isSameOrAfter);
dayjs.extend(minMax);

dayjs.extend(relativeTime);

export function createDayJS(time: Date | string | number | undefined = undefined): dayjs.Dayjs {
  if (time === undefined) {
    return dayjs();
  }

  if (typeof time == "number" && String(time).length === 10) {
    return dayjs.unix(time);
  }

  return dayjs(time);
}

export function getTimestamp(time: number | dayjs.Dayjs): number {
  if (typeof time === "number") {
    return time;
  }

  return time.unix();
}

export function getTimeDiff(seconds: number): string {
  const two = (a: number) => {
    if (a < 10) {
      return `0${a}`;
    }

    return String(a);
  };

  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;

  return [two(h), two(m), two(s)].join(":");
}

export { dayjs };
export default dayjs;
