import type { IRating } from "@xcpcio/types";
import type { Ranks } from "../rank";
import type { Team } from "../team";
import type { RatingUserMap, RatingUsers } from "./rating-user";

import { I18nText } from "../basic-types";
import { RatingCalculator } from "./rating-calculator";
import { RatingHistory } from "./rating-history";
import { RatingUser } from "./rating-user";

export class Rating {
  id: string;
  name: I18nText;
  baseRating: number;

  contestIDs: string[];
  users: RatingUsers;

  ranks: Ranks;
  userMap: RatingUserMap;

  constructor() {
    this.id = "";
    this.name = new I18nText();
    this.baseRating = 1500;

    this.contestIDs = [];
    this.users = [];

    this.ranks = [];
    this.userMap = new Map<string, RatingUser>();
  }

  buildRating() {
    for (const rank of this.ranks) {
      rank.buildRank();

      const ratingCalculator = new RatingCalculator();

      for (const t of rank.teams) {
        const id = this.generateTeamId(t);

        let u = null;

        if (!this.userMap.has(id)) {
          u = new RatingUser();
          u.id = id;
          u.name = t.name;
          u.organization = t.organizationName ?? "";

          u.members = t.members;
          u.coaches = t.coaches;

          u.rank = t.rank;
          u.oldRating = this.baseRating;
          u.UpdateRating(this.baseRating);

          this.userMap.set(id, u);
          this.users.push(u);

          ratingCalculator.users.push(u);
        } else {
          u = this.userMap.get(id)!;
          u.rank = t.rank;
          u.oldRating = u.rating;
          ratingCalculator.users.push(u);
        }

        {
          const h = new RatingHistory();
          h.rank = t.rank;
          h.rating = u.rating;

          h.teamName = t.name;
          h.organization = t.organizationName ?? "";

          h.members = t.members;
          h.coaches = t.coaches;

          h.contestID = rank.contest.id;
          h.contestLink = h.contestID;
          h.contestName = rank.contest.name;
          h.contestTime = rank.contest.startTime;

          u.ratingHistories.push(h);
        }
      }

      ratingCalculator.calculate();

      for (const u of ratingCalculator.users) {
        u.ratingHistories.at(-1)!.rating = u.rating;
      }
    }
  }

  generateTeamId(t: Team) {
    const persons = t.members;
    if (persons.length > 0) {
      return persons.map(person => person.name.getOrDefault().trim()).sort().join("|");
    }

    return `${t.organizationName ?? ""}-${t.name}`;
  }

  toJSON(): IRating {
    return {
      id: this.id,
      name: this.name.toI18NStringSet(),
      baseRating: this.baseRating,

      contestIDs: this.contestIDs,
      users: this.users.map(ratingUser => ratingUser.toJSON()),
    };
  }

  static fromJSON(iRating: IRating | string): Rating {
    if (typeof iRating === "string") {
      iRating = JSON.parse(iRating) as IRating;
    }

    const rating = new Rating();

    rating.id = iRating.id;
    rating.name = I18nText.fromIText(iRating.name);
    rating.baseRating = iRating.baseRating;

    rating.contestIDs = iRating.contestIDs;

    for (const iUser of iRating.users) {
      rating.users.push(RatingUser.fromJSON(iUser));
    }

    return rating;
  }
}
