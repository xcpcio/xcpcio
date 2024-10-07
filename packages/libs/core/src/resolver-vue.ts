import { Resolver } from "./resolver";
import { Team } from "./team";
import type { Teams } from "./team";
import type { Submissions } from "./submission";
import type { Contest } from "./contest";

export class ResolverVue extends Resolver {
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

  startScrollUp: boolean;
  startScrollDown: boolean;

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

    this.startScrollUp = false;
    this.startScrollDown = false;
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

    this.startScrollUp = false;
    this.startScrollDown = false;
  }

  next() {
    if (this.duringAnimation) {
      return;
    }

    if (this.currentOpIndex > this.maxOpIndex) {
      if (this.currentIndex > 0) {
        this.currentIndex--;
      }

      return;
    }

    const op = this.operations[this.currentOpIndex];
    const pIx = op.problemIx;
    const teamId = op.team.id;
    const team = this.teamsMap.get(teamId) as Team;
    const currentRank = team.rank;

    if (this.currentIndex + 1 > currentRank) {
      this.currentIndex--;
      return;
    }

    if (this.currentIndex + 1 !== currentRank) {
      return;
    }

    team.problemStatistics[pIx] = op.afterTeamProblemStatistics;
    team.calcSolvedData(this.contest.options);

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

    {
      let j = this.oldRank - 1;

      while (j >= 0 && Team.compare(this.teams[j], this.teams[j - 1]) < 0) {
        [this.teams[j], this.teams[j - 1]] = [this.teams[j - 1], this.teams[j]];
        this.teams[j].rank = j + 1;
        this.teams[j - 1].rank = j;
        j--;
      }
    }
  }

  rewind() {
    if (this.duringAnimation) {
      return;
    }

    if (this.currentOpIndex < 1) {
      return;
    }

    this.currentOpIndex--;

    const op = this.operations[this.currentOpIndex];
    const pIx = op.problemIx;
    const teamId = op.team.id;
    const team = this.teamsMap.get(teamId) as Team;

    team.problemStatistics[pIx] = op.beforeTeamProblemStatistics;
    team.calcSolvedData(this.contest.options);

    this.currentProblemIndex = pIx;
    this.currentTeamId = teamId;

    {
      this.oldRank = team.rank;
      this.newRank = this.oldRank;
      for (let j = this.currentIndex + 1; j <= this.maxIndex; j++) {
        if (Team.compare(team, this.teams[j]) > 0) {
          this.newRank = this.teams[j].rank;
        } else {
          break;
        }
      }
    }

    {
      let j = this.oldRank - 1;
      let newIndex = j;

      while (j < this.maxIndex && Team.compare(this.teams[j], this.teams[j + 1]) > 0) {
        [this.teams[j], this.teams[j + 1]] = [this.teams[j + 1], this.teams[j]];
        this.teams[j].rank = j + 1;
        this.teams[j + 1].rank = j + 2;
        newIndex = j + 1;
        j++;
      }

      this.currentIndex = newIndex;
    }
  }
}
