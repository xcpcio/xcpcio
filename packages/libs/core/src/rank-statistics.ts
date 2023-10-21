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

  getTeamSolvedNumIndex(solvedNum: number) {
    let res = 0;

    for (let i = solvedNum; i < this.teamSolvedNum.length; i++) {
      if (this.teamSolvedNum[i] > 0) {
        ++res;
      }
    }

    return res;
  }
}
