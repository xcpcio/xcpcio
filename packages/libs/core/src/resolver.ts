import _ from "lodash";

import { Rank } from "./rank";
import { Contest } from "./contest";
import { Teams } from "./team";
import { Submissions, sortSubmissions } from "./submission";
import { TeamProblemStatistics } from "./problem";

export class Resolver extends Rank {
  beforeFreezeSubmissions: Submissions;
  afterFreezeSubmissions: Submissions;

  currentIndex: number;
  maxIndex: number;

  constructor(contest: Contest, teams: Teams, submissions: Submissions) {
    submissions = sortSubmissions(submissions);

    let beforeFreezeSubmissions = submissions;
    let afterFreezeSubmissions = submissions;

    {
      const ix = _.sortedIndex(
        submissions.map((s) => s.timestamp),
        contest.unFreezeDurationTimestamp,
      );

      beforeFreezeSubmissions = submissions.slice(0, ix + 1);
      afterFreezeSubmissions = submissions.slice(ix, -1);
    }

    super(contest, teams, beforeFreezeSubmissions);

    this.beforeFreezeSubmissions = beforeFreezeSubmissions;
    this.afterFreezeSubmissions = afterFreezeSubmissions;

    this.currentIndex = 0;
    this.maxIndex = 0;
  }

  buildResolver() {
    this.buildRank();

    for (const s of this.afterFreezeSubmissions) {
      const teamId = s.teamId;
      const problemId = s.problemId;
      const team = this.teamsMap.get(teamId);
      const problem = this.contest.problemsMap.get(problemId);

      if (team === undefined || problem === undefined) {
        continue;
      }

      const problemStatistics = team.problemStatisticsMap.get(problemId) as TeamProblemStatistics;
      // const submissions = problemStatistics.submissions;
      // const firstSolvedSubmissions = this.firstSolvedSubmissions.get(problemId) as Array<Submission>;

      problemStatistics.pendingCount++;
      problemStatistics.totalCount++;
    }

    this.maxIndex = Math.max(0, this.teams.length - 1);
    this.currentIndex = this.maxIndex;
  }

  up() {
    this.currentIndex--;

    if (this.currentIndex < 0) {
      this.currentIndex = 0;
    }
  }

  down() {
    this.currentIndex++;

    if (this.currentIndex > this.maxIndex) {
      this.currentIndex = this.maxIndex;
    }
  }
}
