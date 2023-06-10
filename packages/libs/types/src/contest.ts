import { BalloonColor, Image, DateTimeISO8601String } from "./basic-types";

export interface Contest {
  contest_name: string;
  start_time: number | DateTimeISO8601String;
  end_time: number | DateTimeISO8601String;

  frozen_time: number; // unit: seconds
  penalty: number; // unit: seconds

  problem_id: Array<string>;

  organization?: string;
  status_time_display?: Record<string, boolean>;
  medal?: Record<string, Record<string, number>>;
  balloon_color?: Array<BalloonColor>;

  group?: Record<string, string>;
  tag?: Record<string, string>;

  badge?: string;
  banner?: Image;

  logo?: Image;
  board_link?: string;

  version?: string;
}
