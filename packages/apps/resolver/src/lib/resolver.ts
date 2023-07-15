import { Contest, Resolver as ResolverCore, Submissions, Team, Teams } from "@xcpcio/core";

import { immerable } from "immer";

export class Resolver extends ResolverCore {
  [immerable] = true;

  maxIndex: number;
  currentIndex: number;

  maxOpIndex: number;
  currentOpIndex: number;

  constructor(contest: Contest, teams: Teams, submissions: Submissions) {
    super(contest, teams, submissions);

    this.maxIndex = 0;
    this.currentIndex = 0;

    this.maxOpIndex = 0;
    this.currentOpIndex = 0;
  }

  buildResolver() {
    super.buildResolver();

    this.maxIndex = this.teams.length - 1;
    this.currentIndex = this.maxIndex;

    this.maxOpIndex = this.operations.length - 1;
    this.currentOpIndex = 0;
  }

  up() {
    if (this.currentIndex === 0) {
      return;
    }

    --this.currentIndex;
  }

  down() {
    if (this.currentIndex === this.maxIndex) {
      return;
    }

    this.currentIndex++;
  }

  right() {
    if (this.currentOpIndex === this.maxOpIndex) {
      return;
    }

    const op = this.operations[this.currentOpIndex];
    const pIx = op.problemIx;
    const team = this.teamsMap.get(op.team.id) as Team;
    const currentRank = team.rank;

    if (this.currentIndex + 1 !== currentRank) {
      return;
    }

    team.problemStatistics[pIx] = op.afterTeamProblemStatistics;
    team.calcSolvedData();

    this.currentOpIndex++;
  }

  left() {
    if (this.currentOpIndex === 0) {
      return;
    }

    this.currentOpIndex--;
  }

  teamScroll() {
    let j = this.currentIndex;
    while (j > 0 && Team.compare(this.teams[j], this.teams[j - 1]) < 0) {
      [this.teams[j], this.teams[j - 1]] = [this.teams[j - 1], this.teams[j]];
      this.teams[j].rank = j + 1;
      this.teams[j - 1].rank = j;
      j--;
    }
  }
}
