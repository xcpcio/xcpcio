import dayjs from 'dayjs';

import duration from 'dayjs/plugin/duration';
dayjs.extend(duration);

import utc from 'dayjs/plugin/utc';
dayjs.extend(utc);

import timezone from 'dayjs/plugin/timezone';
dayjs.extend(timezone);

import advancedFormat from 'dayjs/plugin/advancedFormat';
dayjs.extend(advancedFormat);

export function createDayJS(time: number | Date | string) {
  if (typeof time == 'number' && String(time).length === 10) {
    return dayjs.unix(time);
  }

  return dayjs(time);
}

export { dayjs };
export default dayjs;
