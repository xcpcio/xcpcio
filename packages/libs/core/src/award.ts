export enum MedalType {
  UNKNOWN = "Unknown",
  GOLD = "Gold",
  SILVER = "Silver",
  BRONZE = "Bronze",
  HONORABLE = "Honorable",
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

export function isValidMedalType(medal: MedalType): boolean {
  const validMedalType = [
    MedalType.GOLD,
    MedalType.SILVER,
    MedalType.BRONZE,
    MedalType.HONORABLE,
  ];

  return validMedalType.includes(medal);
}

export type Awards = Map<string, Award[]>;
