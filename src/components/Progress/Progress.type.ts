import dayjs from '@/utils/dayjs';

import { ContestStateType } from '@/core/contest';

export interface ProgressProps {
  start_time?: number;
  end_time?: number;
  frozen_time?: number;

  startTime: dayjs.Dayjs;
  endTime: dayjs.Dayjs;
  frozenStartTime: dayjs.Dayjs;
}

export interface ProgressState {
  start_time?: number;
  end_time?: number;
  frozen_time?: number;
  status?: number;

  width?: number;
  time_pending?: string | number;

  startTime: dayjs.Dayjs;
  endTime: dayjs.Dayjs;
  frozenStartTime: dayjs.Dayjs;

  state: ContestStateType;
  pendingTime?: string;
}

export interface ProgressBigProps extends ProgressProps {
  head_item?: JSX.Element;
  search?: any;
  history?: any;
}
