import type { Ranks } from "../rank";
import type { Team } from "../team";

import { RatingCalculator } from "./rating-calculator";
import { RatingHistory } from "./rating-history";
import type { RatingUserMap, RatingUsers } from "./rating-user";
import { RatingUser } from "./rating-user";

export class Rating {
  id: string;
  name: string;
  baseRating: number;

  ranks: Ranks;
  users: RatingUsers;
  userMap: RatingUserMap;

  constructor() {
    this.id = "";
    this.name = "";
    this.baseRating = 1500;

    this.ranks = [];
    this.users = [];
    this.userMap = new Map<string, RatingUser>();
  }

  buildRating() {
    for (const rank of this.ranks) {
      rank.buildRank();

      for (const u of this.users) {
        u.oldRating = u.rating;
      }

      for (const t of rank.teams) {
        const id = this.generateTeamId(t);

        if (!this.userMap.has(id)) {
          const u = new RatingUser();
          u.id = id;
          u.name = t.name;
          u.rank = t.rank;
          u.oldRating = this.baseRating;
          u.UpdateRating(this.baseRating);

          this.userMap.set(id, u);
          this.users.push(u);
        }
      }

      const ratingCalculator = new RatingCalculator();
      ratingCalculator.users = this.users;
      ratingCalculator.calculate();

      for (const u of this.users) {
        const h = new RatingHistory();
        h.rank = u.rank;
        h.rating = u.rating;

        h.contestID = rank.contest.id;
        h.contestLink = h.contestID;
        h.contestName = rank.contest.name;
        h.contestTime = rank.contest.startTime;

        u.ratingHistories.push(h);
      }
    }
  }

  generateTeamId(t: Team) {
    if (Array.isArray(t.members) && t.members.length > 0) {
      return t.members.join("|");
    }

    return `${t.organization}-${t.name}`;
  }
}
