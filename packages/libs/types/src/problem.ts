import type { BalloonColor } from "./basic-types";

export interface Problem {
  id: string;
  label: string;

  name?: string;

  time_limit?: string;
  memory_limit?: string;

  balloon_color?: BalloonColor;
}

export type Problems = Array<Problem>;
