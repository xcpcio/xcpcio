import { ContestConfig } from "@/types/contest";
import { Image } from "@/types/image";

import { dayjs, createDayJS, getTimeDiff } from "@/utils/dayjs";

export enum ContestStateType {
  PENDING = 0,
  RUNNING = 1,
  FROZEN = 2,
  FINISHED = 3,
}

export function getContestDuration(
  startTime: dayjs.Dayjs,
  endTime: dayjs.Dayjs,
  timeFormat: string = "HH:mm:ss",
): string {
  return dayjs.duration(endTime.diff(startTime)).format(timeFormat);
}

export function getContestState(
  startTime: dayjs.Dayjs,
  endTime: dayjs.Dayjs,
  frozenStartTime: dayjs.Dayjs,
): ContestStateType {
  const now = dayjs();
  if (now.isBefore(startTime)) return ContestStateType.PENDING;
  if (now.isSameOrAfter(endTime)) return ContestStateType.FINISHED;
  if (now.isSameOrAfter(frozenStartTime)) return ContestStateType.FROZEN;

  return ContestStateType.RUNNING;
}

export function getContestPendingTime(startTime: dayjs.Dayjs): string {
  let now = dayjs();
  if (now.isAfter(startTime)) now = startTime;

  return getTimeDiff(Math.floor(dayjs.duration(startTime.diff(now)).asSeconds()));
}

export function getContestRemainingTime(endTime: dayjs.Dayjs): string {
  let now = dayjs();
  if (now.isAfter(endTime)) now = endTime;

  return getTimeDiff(Math.floor(dayjs.duration(endTime.diff(now)).asSeconds()));
}

export function getContestElapsedTime(startTime: dayjs.Dayjs, endTime: dayjs.Dayjs): string {
  let now = dayjs();
  if (now.isAfter(endTime)) now = endTime;

  return getTimeDiff(Math.floor(dayjs.duration(now.diff(startTime)).asSeconds()));
}

export function getContestProgressRatio(startTime: dayjs.Dayjs, endTime: dayjs.Dayjs): number {
  const now = dayjs();
  if (startTime.isSameOrAfter(now)) return 0;
  if (endTime.isSameOrBefore(now)) return 100;

  const total = endTime.diff(startTime, "s");
  const pass = now.diff(startTime, "s");
  return Math.round((pass * 100) / total);
}

export interface ContestInstance extends ContestConfig {
  startTime: dayjs.Dayjs;
  endTime: dayjs.Dayjs;

  frozenStartTime: dayjs.Dayjs;

  getContestDuration: () => string;
  getContestState: () => ContestStateType;
  getContestPendingTime: () => string;
  getContestRemainingTime: () => string;
  getContestElapsedTime: () => string;
  getContestProgressRatio: () => number;
}

export function createContestInstance(raw_contest_config_json: any): ContestInstance {
  const contest_name = raw_contest_config_json?.contest_name ?? "";
  const start_time = raw_contest_config_json?.start_time ?? 0;
  const end_time = raw_contest_config_json?.end_time ?? 0;
  const frozen_time = raw_contest_config_json?.frozen_time ?? 0;
  const penalty = raw_contest_config_json?.penalty ?? 0;
  const problem_id = raw_contest_config_json?.problem_id ?? [];

  const group = raw_contest_config_json?.group;
  const organization = raw_contest_config_json?.organization;
  const status_time_display = raw_contest_config_json?.status_time_display;
  const medal = raw_contest_config_json?.medal;
  const balloon_color = raw_contest_config_json?.balloon_color;

  const badge = raw_contest_config_json?.badge;
  const banner = raw_contest_config_json?.banner;

  const logo: Image = raw_contest_config_json?.logo;
  if (logo?.type) logo.type = "png";

  const link = raw_contest_config_json?.link;
  const board_link = raw_contest_config_json?.board_link;

  const startTime = createDayJS(start_time);
  const endTime = createDayJS(end_time);
  const frozenStartTime = endTime.subtract(frozen_time, "s");

  const getContestDuration_ = (timeFormat: string = "HH:mm:ss"): string => {
    return getContestDuration(startTime, endTime, timeFormat);
  };

  const getContestState_ = (): ContestStateType => {
    return getContestState(startTime, endTime, frozenStartTime);
  };

  const getContestPendingTime_ = (): string => {
    return getContestPendingTime(startTime);
  };

  const getContestRemainingTime_ = (): string => {
    return getContestRemainingTime(endTime);
  };

  const getContestElapsedTime_ = (): string => {
    return getContestElapsedTime(startTime, endTime);
  };

  const getContestProgressRatio_ = (): number => {
    return getContestProgressRatio(startTime, endTime);
  };

  return {
    contest_name,
    start_time,
    end_time,
    frozen_time,
    penalty,
    problem_id,
    group,
    organization,
    status_time_display,
    medal,
    balloon_color,
    badge,
    banner,
    logo,
    link,
    board_link,
    startTime,
    endTime,
    frozenStartTime,
    getContestDuration: getContestDuration_,
    getContestState: getContestState_,
    getContestPendingTime: getContestPendingTime_,
    getContestRemainingTime: getContestRemainingTime_,
    getContestElapsedTime: getContestElapsedTime_,
    getContestProgressRatio: getContestProgressRatio_,
  };
}
