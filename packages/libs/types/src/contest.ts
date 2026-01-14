import type { BalloonColor, DataItem, DateTimeISO8601String, Image, Organizations, StatusTimeDisplay, Text, TimeUnit } from "./basic-types";
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

  has_reaction_videos?: boolean;
  // example: https://your.video.cdn/wf/2025/${submission_id}.mp4
  // ${submission_id} will be replaced with the submission id
  reaction_video_url_template?: string;

  // example: https://your.image.cdn/wf/2025/${team_id}.jpg
  // ${team_id} will be replaced with the team id
  team_photo_url_template?: Image;

  // example: https://your.stream.cdn/wf/2025/${team_id}/webcam/index.m3u8
  // ${team_id} will be replaced with the team id
  team_webcam_stream_url_template?: string;

  // example: https://your.stream.cdn/wf/2025/${team_id}/screen/index.m3u8
  // ${team_id} will be replaced with the team id
  team_screen_stream_url_template?: string;

  // example: https://your.online.judge/contest/1234/submission/${submission_id}
  // ${submission_id} will be replaced with the submission id
  submission_external_url_template?: string;

  // example: https://your.code.cdn/wf/2025/${submission_id}.zip
  // ${submission_id} will be replaced with the submission id
  submission_source_code_url_template?: string;
}

export type MedalPreset = "ccpc" | "icpc";
export type BannerMode = "ONLY_BANNER" | "ALL";

export interface Contest {
  contest_name: Text;
  description?: Text;
  og_image?: Image;

  start_time: number | DateTimeISO8601String;
  end_time: number | DateTimeISO8601String;
  penalty: number; // unit: seconds

  freeze_time?: number | DateTimeISO8601String;
  frozen_time?: number; // unit: seconds

  problems?: Array<Problem>;

  problem_id?: Array<string>; // Array of problem identifiers (e.g., ["A", "B", "C"])
  balloon_color?: Array<BalloonColor>; // Array of balloon colors corresponding to each problem

  status_time_display?: StatusTimeDisplay;

  badge?: string;
  organization?: string;

  medal?: Record<string, Record<string, number>> | MedalPreset;

  group?: Record<string, string>;
  tag?: Record<string, string>;

  logo?: Image;
  banner?: Image;
  banner_mode?: BannerMode;

  options?: ContestOptions;

  organizations?: DataItem | Organizations;

  board_link?: string;
  version?: string;
}
