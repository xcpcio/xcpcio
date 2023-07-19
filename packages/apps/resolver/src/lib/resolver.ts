import { Contest, Resolver as ResolverCore, Submissions, Team, Teams } from "@xcpcio/core";

import { immerable } from "immer";

export class Resolver extends ResolverCore {
  [immerable] = true;

  readonly FLASHING_TIME_MS = 100;
  readonly ROLLING_TIME_MS = 600;

  maxIndex: number;
  currentIndex: number;

  maxOpIndex: number;
  currentOpIndex: number;

  oldRank: number;
  newRank: number;

  currentTeamId: string;
  currentProblemIndex: number;

  problemFlashingEnded: boolean;
  duringAnimation: boolean;

  constructor(contest: Contest, teams: Teams, submissions: Submissions) {
    super(contest, teams, submissions);

    this.maxIndex = 0;
    this.currentIndex = 0;

    this.maxOpIndex = 0;
    this.currentOpIndex = 0;

    this.oldRank = -1;
    this.newRank = -1;

    this.currentTeamId = "";
    this.currentProblemIndex = -1;

    this.problemFlashingEnded = true;
    this.duringAnimation = false;
  }

  buildResolver() {
    super.buildResolver();

    this.maxIndex = this.teams.length - 1;
    this.currentIndex = this.maxIndex;

    this.maxOpIndex = this.operations.length - 1;
    this.currentOpIndex = 0;

    this.oldRank = -1;
    this.newRank = -1;

    this.currentTeamId = "";
    this.currentProblemIndex = -1;

    this.problemFlashingEnded = true;
    this.duringAnimation = false;
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
    if (this.duringAnimation) {
      return;
    }

    if (this.currentOpIndex > this.maxOpIndex) {
      return;
    }

    const op = this.operations[this.currentOpIndex];
    const pIx = op.problemIx;
    const teamId = op.team.id;
    const team = this.teamsMap.get(teamId) as Team;
    const currentRank = team.rank;

    if (this.currentIndex + 1 !== currentRank) {
      return;
    }

    team.problemStatistics[pIx] = op.afterTeamProblemStatistics;
    team.calcSolvedData();

    this.currentProblemIndex = pIx;
    this.currentTeamId = teamId;

    {
      this.oldRank = team.rank;
      this.newRank = this.oldRank;
      for (let j = this.currentIndex - 1; j >= 0; j--) {
        if (Team.compare(team, this.teams[j]) < 0) {
          this.newRank = this.teams[j].rank;
        } else {
          break;
        }
      }
    }

    this.currentOpIndex++;
  }

  left() {
    if (this.currentOpIndex < 0) {
      return;
    }

    this.currentOpIndex--;
  }

  teamScrollUp() {
    let j = this.currentIndex;
    while (j > 0 && Team.compare(this.teams[j], this.teams[j - 1]) < 0) {
      [this.teams[j], this.teams[j - 1]] = [this.teams[j - 1], this.teams[j]];
      this.teams[j].rank = j + 1;
      this.teams[j - 1].rank = j;
      j--;
    }
  }
}
