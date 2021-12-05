import dayjs from 'dayjs';

import duration from 'dayjs/plugin/duration';
dayjs.extend(duration);

import utc from 'dayjs/plugin/utc';
dayjs.extend(utc);

import timezone from 'dayjs/plugin/timezone';
dayjs.extend(timezone);

import advancedFormat from 'dayjs/plugin/advancedFormat';
dayjs.extend(advancedFormat);

import isSameOrBefore from 'dayjs/plugin/isSameOrBefore';
dayjs.extend(isSameOrBefore);

import isSameOrAfter from 'dayjs/plugin/isSameOrAfter';
dayjs.extend(isSameOrAfter);

import minMax from 'dayjs/plugin/minMax';
dayjs.extend(minMax);

import relativeTime from 'dayjs/plugin/relativeTime';
dayjs.extend(relativeTime);

export function createDayJS(
  time: number | Date | string | undefined = undefined,
): dayjs.Dayjs {
  if (typeof time === 'undefined') {
    return dayjs();
  }

  if (typeof time == 'number' && String(time).length === 10) {
    return dayjs.unix(time);
  }

  return dayjs(time);
}

export function getTimeStamp(time: number | dayjs.Dayjs): number {
  if (typeof time === 'number') {
    return time;
  }

  return time.unix();
}

export function getTimeDiff(seconds: number): string {
  const two = (a: number) => {
    if (a < 10) return '0' + a;
    return String(a);
  };

  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;

  return [two(h), two(m), two(s)].join(':');
}

export { dayjs };
export default dayjs;
