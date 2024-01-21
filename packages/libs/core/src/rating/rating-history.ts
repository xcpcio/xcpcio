import type { dayjs } from "../utils";
import { createDayJS } from "../utils";

export class RatingHistory {
  rank: number;
  rating: number;

  contestID: string;
  contestName: string;
  contestLink: string;
  contestTime: dayjs.Dayjs;

  constructor() {
    this.rank = 0;
    this.rating = 0;

    this.contestID = "";
    this.contestName = "";
    this.contestLink = "";
    this.contestTime = createDayJS();
  }
}

export type RatingHistories = Array<RatingHistory>;
