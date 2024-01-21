export interface IRatingHistory {
  rank: number;
  rating: number;

  contestID: string;
  contestName: string;
  contestLink: string;
  contestTime: Date;
}

export interface IRatingUser {
  id: string;
  name: string;

  rating: number;
  minRating: number;
  maxRating: number;

  ratingHistories: IRatingHistory[];
}

export interface IRating {
  id: string;
  name: string;
  baseRating: number;

  rankIDs: string[];
  users: IRatingUser[];
}
