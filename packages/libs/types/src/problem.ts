import { BalloonColor } from "./basic-types";

export interface ProblemStatistics {
  accepted: number;
  submitted: number;
}

export interface Problem {
  id: string;

  name?: string;
  label?: string;

  time_limit?: string;
  memory_limit?: string;

  balloon_color?: BalloonColor;

  statistics?: ProblemStatistics;
}
