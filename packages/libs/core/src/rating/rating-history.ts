import type { IRatingHistory } from "@xcpcio/types";
import type { Persons } from "../person";
import type { dayjs } from "../utils";

import { Person } from "../person";
import { createDayJS } from "../utils";

export class RatingHistory {
  rank: number;
  rating: number;

  teamName: string;
  organization: string;

  members: Persons;
  coaches: Persons;

  contestID: string;
  contestName: string;
  contestLink: string;
  contestTime: dayjs.Dayjs;

  constructor() {
    this.rank = 0;
    this.rating = 0;

    this.teamName = "";
    this.organization = "";

    this.members = [];
    this.coaches = [];

    this.contestID = "";
    this.contestName = "";
    this.contestLink = "";
    this.contestTime = createDayJS();
  }

  toJSON(): IRatingHistory {
    return {
      rank: this.rank,
      rating: this.rating,

      teamName: this.teamName,
      organization: this.organization,

      members: this.members.map(member => member.toJSON()),
      coaches: this.coaches.map(coach => coach.toJSON()),

      contestID: this.contestID,
      contestName: this.contestName,
      contestLink: this.contestLink,
      contestTime: this.contestTime.toDate(),
    };
  }

  static fromJSON(iRatingHistory: IRatingHistory | string): RatingHistory {
    if (typeof iRatingHistory === "string") {
      iRatingHistory = JSON.parse(iRatingHistory) as IRatingHistory;
    }

    const ratingHistory = new RatingHistory();
    ratingHistory.rank = iRatingHistory.rank;
    ratingHistory.rating = iRatingHistory.rating;

    ratingHistory.teamName = iRatingHistory.teamName;
    ratingHistory.organization = iRatingHistory.organization;

    ratingHistory.members = iRatingHistory.members.map(iMember => Person.fromJSON(iMember));
    ratingHistory.coaches = iRatingHistory.coaches.map(iCoach => Person.fromJSON(iCoach));

    ratingHistory.contestID = iRatingHistory.contestID;
    ratingHistory.contestName = iRatingHistory.contestName;
    ratingHistory.contestLink = iRatingHistory.contestLink;
    ratingHistory.contestTime = createDayJS(iRatingHistory.contestTime);

    return ratingHistory;
  }
}

export type RatingHistories = Array<RatingHistory>;
