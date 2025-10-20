import type { BalloonColor, Text } from "./basic-types";

export interface Problem {
  id: string;
  label: string;

  name?: Text;

  time_limit?: string;
  memory_limit?: string;

  balloon_color?: BalloonColor;
}

export type Problems = Array<Problem>;
