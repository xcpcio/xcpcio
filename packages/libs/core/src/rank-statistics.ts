export class RankStatistics {
  teamSolvedNum: Array<number>;
  teamSolvedNumIndex: Array<number>;
  maxSolvedProblems: number;

  effectiveTeamNum: number;

  constructor() {
    this.teamSolvedNum = [];
    this.teamSolvedNumIndex = [];
    this.maxSolvedProblems = 0;

    this.effectiveTeamNum = 0;
  }

  reset() {
    this.teamSolvedNum = [];
    this.teamSolvedNumIndex = [];
    this.maxSolvedProblems = 0;

    this.effectiveTeamNum = 0;
  }

  getTeamSolvedNumIndex(solvedNum: number): number {
    return this.teamSolvedNumIndex[solvedNum] ?? 0;
  }
}
