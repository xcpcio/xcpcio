export interface BalloonColor {
  background_color: string;
  color: string;
}

export interface ContestConfig {
  contest_name: string;
  start_time: string | number | Date;
  end_time: string | number | Date;
  frozen_time: number;
  penalty: number;
  problem_id: string[];
  group?: Record<string, string>;
  organization?: string;
  status_time_display?: Record<string, string>;
  medal?: Record<string, Record<string, string>>;
  balloon_color?: BalloonColor[];
}
