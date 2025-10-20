import type { BalloonColor, DateTimeISO8601String, Image, Text, TimeUnit } from "./basic-types";
import type { Problem } from "./problem";

export enum ContestState {
  PENDING = "PENDING",
  RUNNING = "RUNNING",
  FROZEN = "FROZEN",
  FINISHED = "FINISHED",
  PAUSED = "PAUSED",
}

export type CalculationOfPenalty = "in_minutes"
  | "in_seconds"
  | "accumulate_in_seconds_and_finally_to_the_minute";

export interface ContestOptions {
  calculation_of_penalty?: CalculationOfPenalty;
  submission_timestamp_unit?: TimeUnit;

  // deprecated, please use has_reaction_videos instead
  submission_has_reaction?: boolean;

  has_reaction_videos?: boolean;

  // example: https://your.video.cdn/wf/2025/${submission_id}.mp4
  // ${submission_id} will be replaced with the submission id
  reaction_video_url_template?: string;
}

export type MedalPreset = "ccpc" | "icpc";
export type BannerMode = "ONLY_BANNER" | "ALL";

export interface Contest {
  contest_name: Text;

  start_time: number | DateTimeISO8601String;
  end_time: number | DateTimeISO8601String;
  penalty: number; // unit: seconds

  freeze_time?: number | DateTimeISO8601String;
  frozen_time?: number; // unit: seconds

  problems?: Array<Problem>;
  problem_id?: Array<string>;

  organization?: string;
  status_time_display?: Record<string, boolean>;

  badge?: string;
  medal?: Record<string, Record<string, number>> | MedalPreset;
  balloon_color?: Array<BalloonColor>;

  group?: Record<string, string>;
  tag?: Record<string, string>;

  logo?: Image;
  banner?: Image;
  banner_mode?: BannerMode;
  board_link?: string;

  version?: string;

  options?: ContestOptions;
}
