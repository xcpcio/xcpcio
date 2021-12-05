import dayjs from '@/utils/dayjs';

import { ContestStateType } from '@/core/contest';
import ProgressWithScroll from './ProgressWithScroll';

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

export interface ProgressWithScrollProps extends ProgressProps {
  search: any;
  history: any;
}

export interface ProgressWithScrollState extends ProgressState {
  scrollWidth?: number;

  search: any;
  history: any;
}

export interface ProgressBigProps extends ProgressWithScrollProps {
  head_item?: JSX.Element;
}

export interface ProgressBigState extends ProgressWithScrollState {
  head_item?: JSX.Element | null;

  pendingTime: string;
  remainingTime: string;
  elapsedTime: string;
}
