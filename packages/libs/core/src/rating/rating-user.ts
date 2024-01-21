export class RatingUser {
  id: string;

  rank: number;
  seed: number;
  delta: number;
  oldRating: number;
  newRating: number;

  constructor() {
    this.id = "";

    this.rank = 0;
    this.seed = 1;
    this.delta = 0;
    this.oldRating = 0;
    this.newRating = 0;
  }
}

export type RatingUsers = Array<RatingUser>;
