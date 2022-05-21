import { Image } from './image';

export interface BalloonColor {
  background_color: string;
  color: string;
}

export interface Link {
  homepage?: string;
  registration?: string;
}

export interface ContestConfig {
  contest_name: string;
  start_time: string | number | Date;
  end_time: string | number | Date;
  frozen_time: number;
  penalty: number;
  problem_id: string[];

  group?: Record<string, string>;
  tag?: Record<string, string>;
  organization?: string;
  status_time_display?: Record<string, boolean>;
  medal?: Record<string, Record<string, string>>;
  balloon_color?: BalloonColor[];

  badge?: string;
  banner?: Image;

  logo?: Image;
  link?: Link;
  board_link?: string;
}
