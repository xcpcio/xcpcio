export enum RatingLevel {
  NEWBIE = "NEWBIE",
  PUPIL = "PUPIL",
  SPECIALIST = "SPECIALIST",
  EXPERT = "EXPERT",
  CANDIDATE_MASTER = "CANDIDATE_MASTER",
  MASTER = "MASTER",
  INTERNATIONAL_MASTER = "INTERNATIONAL_MASTER",
  GRANDMASTER = "GRANDMASTER",
  INTERNATIONAL_GRANDMASTER = "INTERNATIONAL_GRANDMASTER",
  LEGENDARY_GRANDMASTER = "LEGENDARY_GRANDMASTER",
}

export const RatingLevelToString: { [key in RatingLevel]: string } = {
  [RatingLevel.NEWBIE]: "Newbie",
  [RatingLevel.PUPIL]: "Pupil",
  [RatingLevel.SPECIALIST]: "Specialist",
  [RatingLevel.EXPERT]: "Expert",
  [RatingLevel.CANDIDATE_MASTER]: "Candidate Master",
  [RatingLevel.MASTER]: "Master",
  [RatingLevel.INTERNATIONAL_MASTER]: "International Master",
  [RatingLevel.GRANDMASTER]: "Grandmaster",
  [RatingLevel.INTERNATIONAL_GRANDMASTER]: "International Grandmaster",
  [RatingLevel.LEGENDARY_GRANDMASTER]: "Legendary Grandmaster",
};

export class RatingUtility {
  static getRatingLevel(rating: number): RatingLevel {
    if (rating >= 3000) {
      return RatingLevel.LEGENDARY_GRANDMASTER;
    } else if (rating >= 2600) {
      return RatingLevel.INTERNATIONAL_GRANDMASTER;
    } else if (rating >= 2400) {
      return RatingLevel.GRANDMASTER;
    } else if (rating >= 2300) {
      return RatingLevel.INTERNATIONAL_MASTER;
    } else if (rating >= 2100) {
      return RatingLevel.MASTER;
    } else if (rating >= 1900) {
      return RatingLevel.CANDIDATE_MASTER;
    } else if (rating >= 1600) {
      return RatingLevel.EXPERT;
    } else if (rating >= 1400) {
      return RatingLevel.SPECIALIST;
    } else if (rating >= 1200) {
      return RatingLevel.PUPIL;
    }

    return RatingLevel.NEWBIE;
  }

  static getRatingLevelClass(ratingLevel: RatingLevel | number): string {
    if (typeof ratingLevel === "number") {
      return this.getRatingLevelClass(this.getRatingLevel(ratingLevel));
    }

    switch (ratingLevel) {
      case RatingLevel.NEWBIE:
        return "user-gray";
      case RatingLevel.PUPIL:
        return "user-green";
      case RatingLevel.SPECIALIST:
        return "user-cyan";
      case RatingLevel.EXPERT:
        return "user-blue";
      case RatingLevel.CANDIDATE_MASTER:
        return "user-violet";
      case RatingLevel.MASTER:
        return "user-orange";
      case RatingLevel.INTERNATIONAL_MASTER:
        return "user-orange";
      case RatingLevel.GRANDMASTER:
        return "user-red";
      case RatingLevel.INTERNATIONAL_GRANDMASTER:
        return "user-red";
      case RatingLevel.LEGENDARY_GRANDMASTER:
        return "user-legendary";
    }
  }
}
