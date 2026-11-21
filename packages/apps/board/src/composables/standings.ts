import type { Rank, Team, TeamProblemStatistics } from "@xcpcio/core";
import type { StatusTimeDisplay } from "@xcpcio/types";
import { GiantsType, MedalType } from "@xcpcio/core";

export type AwardKey = "gold" | "silver" | "bronze" | "honorable";

export interface StandClassNameOptions {
  isRankField?: boolean;
  isFilter?: boolean;
  giantsType?: GiantsType;
}

export function getAwardKey(team: Team): AwardKey | undefined {
  if (team.awards.includes(MedalType.GOLD)) {
    return "gold";
  }

  if (team.awards.includes(MedalType.SILVER)) {
    return "silver";
  }

  if (team.awards.includes(MedalType.BRONZE)) {
    return "bronze";
  }

  if (team.awards.includes(MedalType.HONORABLE)) {
    return "honorable";
  }

  return undefined;
}

export function getStandClassName(
  rank: Rank,
  team: Team,
  ix: number,
  options: StandClassNameOptions = {},
): string {
  if (options.isRankField) {
    const award = getAwardKey(team);
    if (award) {
      return award;
    }
  }

  if (options.giantsType !== undefined) {
    switch (options.giantsType) {
      case GiantsType.BLUE:
        return "bg-blue-400";
      case GiantsType.RED:
        return "bg-red-400";
    }
  }

  if (options.isFilter) {
    return "filter-team";
  }

  const solvedProblemIndex = (rank.rankStatistics.getTeamSolvedNumIndex(team.solvedProblemNum) - 1) % 2;
  const rankIndex = ix % 2;

  return `stand${solvedProblemIndex}${rankIndex}`;
}

export function getProblemSign(p: TeamProblemStatistics): string {
  if (p.isSolved) {
    return "+";
  }

  if (p.isWrongAnswer) {
    return "-";
  }

  if (p.isPending) {
    return `? ${p.pendingCount}`;
  }

  return "";
}

export function getProblemShow(p: TeamProblemStatistics, statusTimeDisplay: StatusTimeDisplay): string {
  let res = "";

  if (!p.isUnSubmitted) {
    res += `${p.failedCount + Number(p.isSolved)}`;
  }

  if ((p.isSolved && statusTimeDisplay.correct)
    || (p.isPending && statusTimeDisplay.pending)
    || (p.isWrongAnswer && statusTimeDisplay.incorrect)) {
    res += `/${Math.floor(p.lastSubmitTimestamp / 60)}`;
  }

  return res;
}

export type ProblemColorClass = "first-solve" | "correct" | "incorrect" | "pending" | "unattempted";

export function getProblemColorClass(p: TeamProblemStatistics): ProblemColorClass {
  if (p.isFirstSolved) {
    return "first-solve";
  }

  if (p.isSolved) {
    return "correct";
  }

  if (p.isWrongAnswer) {
    return "incorrect";
  }

  if (p.isPending) {
    return "pending";
  }

  return "unattempted";
}
