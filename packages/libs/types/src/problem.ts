import { BalloonColor } from "./basic-types";

export interface ProblemStatistics {
  accepted: number;
  submitted: number;
}

export interface Problem {
  id: string;
  label: string;

  name?: string;

  time_limit?: string;
  memory_limit?: string;

  balloon_color?: BalloonColor;

  statistics?: ProblemStatistics;
}

export type Problems = Array<Problem>;
