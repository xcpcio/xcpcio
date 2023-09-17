export class RankStatistics {
  teamSolvedNum: Array<number>;
  maxSolvedProblems: number;

  constructor() {
    this.teamSolvedNum = [];
    this.maxSolvedProblems = 0;
  }

  reset() {
    this.teamSolvedNum = [];
    this.maxSolvedProblems = 0;
  }
}
