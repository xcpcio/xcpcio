import type { RatingHistories } from "./rating-history";

export class RatingUser {
  id: string;
  name: string;

  rank: number;
  rating: number;
  minRating: number;
  maxRating: number;
  oldRating: number;

  seed: number;
  delta: number;

  ratingHistories: RatingHistories;

  constructor() {
    this.id = "";
    this.name = "";

    this.rank = 0;
    this.rating = 0;
    this.minRating = 0x3F3F3F3F;
    this.maxRating = -0x3F3F3F3F;
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
}

export type RatingUsers = Array<RatingUser>;
export type RatingUserMap = Map<string, RatingUser>;
