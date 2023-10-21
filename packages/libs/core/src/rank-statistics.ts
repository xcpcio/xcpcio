export class RankStatistics {
  teamSolvedNum: Array<number>;
  teamSolvedNumIndex: Array<number>;
  maxSolvedProblems: number;

  constructor() {
    this.teamSolvedNum = [];
    this.teamSolvedNumIndex = [];
    this.maxSolvedProblems = 0;
  }

  reset() {
    this.teamSolvedNum = [];
    this.teamSolvedNumIndex = [];
    this.maxSolvedProblems = 0;
  }

  getTeamSolvedNumIndex(solvedNum: number): number {
    return this.teamSolvedNumIndex[solvedNum] ?? 0;
  }
}
