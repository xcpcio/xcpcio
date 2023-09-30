export enum MedalType {
  UNKNOWN,
  GOLD,
  SILVER,
  BRONZE,
  HONORABLE,
}

export class Award {
  medalType: MedalType;
  minRank: number;
  maxRank: number;

  constructor() {
    this.medalType = MedalType.UNKNOWN;
    this.minRank = 0;
    this.maxRank = 0;
  }
}

export type Awards = Map<string, Award[]>;
