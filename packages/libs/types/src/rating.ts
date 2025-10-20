import type { Persons } from "./person";

export interface IRatingIndex {
  id: string;
  name: string;
}

export interface IRatingHistory {
  rank: number;
  rating: number;

  teamName: string;
  organization: string;

  members: Persons;
  coaches: Persons;

  contestID: string;
  contestName: string;
  contestLink: string;
  contestTime: Date;
}

export interface IRatingUser {
  id: string;
  name: string;
  organization: string;

  members: Persons;
  coaches: Persons;

  rating: number;
  minRating: number;
  maxRating: number;

  ratingHistories: IRatingHistory[];
}

export interface IRating {
  id: string;
  name: string;
  baseRating: number;

  contestIDs: string[];
  users: IRatingUser[];
}
