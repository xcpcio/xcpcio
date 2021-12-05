import { ContestInstance } from '@/core';

export interface BoardProps {
  history?: any;
  location?: any;
  [key: string]: any;
}

export interface BoardState {
  contest_config: ContestInstance;
  [key: string]: any;
}
