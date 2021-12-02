import { ContestConfig } from '@/types/contest';
import { Image } from '@/types/image';

import dayjs, { createDayJS } from '@/utils/dayjs';

export interface ContestInstance extends ContestConfig {
  startTime: dayjs.Dayjs;
  endTime: dayjs.Dayjs;

  getContestDuration: () => string;
}

export function createContestInstance(
  raw_contest_config_json: any,
): ContestInstance {
  const contest_name = raw_contest_config_json?.contest_name ?? '';
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

  const logo: Image = raw_contest_config_json?.logo;
  if (logo?.type) logo.type = 'png';

  const link = raw_contest_config_json?.link;
  const board_link = raw_contest_config_json?.board_link;

  const startTime = createDayJS(start_time);
  const endTime = createDayJS(end_time);

  const getContestDuration = (timeFormat: string = 'HH:mm:ss'): string => {
    return dayjs.duration(endTime.diff(startTime)).format(timeFormat);
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
    logo,
    link,
    board_link,
    startTime,
    endTime,
    getContestDuration,
  };
}
