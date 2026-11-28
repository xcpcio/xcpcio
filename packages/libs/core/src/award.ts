import { MedalAwardType } from "@xcpcio/types";

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

/**
 * Preset award types from the contest config.
 */
const MEDAL_AWARD_TYPE_TO_TYPE: Partial<Record<MedalAwardType, MedalType>> = {
  [MedalAwardType.GOLD]: MedalType.GOLD,
  [MedalAwardType.SILVER]: MedalType.SILVER,
  [MedalAwardType.BRONZE]: MedalType.BRONZE,
  [MedalAwardType.HONORABLE]: MedalType.HONORABLE,
  [MedalAwardType.CHAMPION]: MedalType.GOLD,
  [MedalAwardType.RUNNER_UP]: MedalType.SILVER,
  [MedalAwardType.SECOND_RUNNER_UP]: MedalType.BRONZE,
};

const MEDAL_TYPE_PRIORITY: Record<MedalType, number> = {
  [MedalType.UNKNOWN]: 0,
  [MedalType.HONORABLE]: 1,
  [MedalType.BRONZE]: 2,
  [MedalType.SILVER]: 3,
  [MedalType.GOLD]: 4,
};

export function getMedalTypeFromAwardType(awardType?: MedalAwardType | null): MedalType | undefined {
  if (!awardType) {
    return undefined;
  }

  return MEDAL_AWARD_TYPE_TO_TYPE[awardType];
}

export function getMedalTypePriority(medalType: MedalType): number {
  return MEDAL_TYPE_PRIORITY[medalType] ?? 0;
}

export type Awards = Map<string, Award[]>;
export type TeamMedals = Map<string, MedalType>;
