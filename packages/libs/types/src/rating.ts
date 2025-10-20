import type { Text } from "./basic-types";
import type { Persons } from "./person";

export interface IRatingIndex {
  id: string;
  name: string;
}

export interface IRatingHistory {
  rank: number;
  rating: number;

  teamName: Text;
  organization: string;

  members: Persons;
  coaches: Persons;

  contestID: string;
  contestName: Text;
  contestLink: string;
  contestTime: Date;
}

export interface IRatingUser {
  id: string;
  name: Text;
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
  name: Text;
  baseRating: number;

  contestIDs: string[];
  users: IRatingUser[];
}
