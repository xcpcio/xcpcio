import type { IRatingHistory } from "@xcpcio/types";

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

  toJSON(): IRatingHistory {
    return {
      rank: this.rank,
      rating: this.rating,

      contestID: this.contestID,
      contestName: this.contestName,
      contestLink: this.contestLink,
      contestTime: this.contestTime.toDate(),
    };
  }
}

export type RatingHistories = Array<RatingHistory>;

export function createRatingHistory(iRatingHistory: IRatingHistory): RatingHistory {
  const ratingHistory = new RatingHistory();
  ratingHistory.rank = iRatingHistory.rank;
  ratingHistory.rating = iRatingHistory.rating;

  ratingHistory.contestID = iRatingHistory.contestID;
  ratingHistory.contestName = iRatingHistory.contestName;
  ratingHistory.contestLink = iRatingHistory.contestLink;
  ratingHistory.contestTime = createDayJS(iRatingHistory.contestTime);

  return ratingHistory;
}
