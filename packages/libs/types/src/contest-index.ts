import type { Image } from "./basic-types";

export interface ContestIndexConfig {
  contest_name: string;
  start_time: number;
  end_time: number;
  frozen_time: number;
  logo: Image;
}

export interface ContestIndex {
  config: ContestIndexConfig;
  board_link: string;
}
