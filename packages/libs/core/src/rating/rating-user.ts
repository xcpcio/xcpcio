import type { IRatingUser } from "@xcpcio/types/index";
import { type RatingHistories, createRatingHistory } from "./rating-history";

export class RatingUser {
  id: string;
  name: string;

  rating: number;
  minRating: number;
  maxRating: number;

  rank: number;
  oldRating: number;

  seed: number;
  delta: number;

  ratingHistories: RatingHistories;

  constructor() {
    this.id = "";
    this.name = "";

    this.rating = 0;
    this.minRating = 0x3F3F3F3F;
    this.maxRating = -0x3F3F3F3F;

    this.rank = 0;
    this.oldRating = 0;

    this.seed = 1.0;
    this.delta = 0;

    this.ratingHistories = [];
  }

  UpdateRating(rating: number) {
    this.rating = rating;
    this.minRating = Math.min(this.minRating, rating);
    this.maxRating = Math.max(this.maxRating, rating);
  }

  toJSON(): IRatingUser {
    return {
      id: this.id,
      name: this.name,

      rating: this.rating,
      minRating: this.minRating,
      maxRating: this.maxRating,

      ratingHistories: this.ratingHistories.map(ratingHistory => ratingHistory.toJSON()),
    };
  }
}

export type RatingUsers = Array<RatingUser>;
export type RatingUserMap = Map<string, RatingUser>;

export function createRatingUser(iRatingUser: IRatingUser): RatingUser {
  const ratingUser = new RatingUser();

  ratingUser.id = iRatingUser.id;
  ratingUser.name = iRatingUser.name;

  ratingUser.rating = iRatingUser.rating;
  ratingUser.minRating = iRatingUser.minRating;
  ratingUser.maxRating = iRatingUser.maxRating;

  for (const iRatingHistory of iRatingUser.ratingHistories) {
    ratingUser.ratingHistories.push(createRatingHistory(iRatingHistory));
  }

  return ratingUser;
}
