import _ from "lodash";

import type { Contest } from "./contest";
import type { Teams } from "./team";
import { Team } from "./team";
import type { Submissions } from "./submission";
import { Submission } from "./submission";
import { TeamProblemStatistics } from "./problem";

export class Rank {
  readonly contest: Contest;

  teams: Teams;
  teamsMap: Map<string, Team>;

  submissions: Submissions;
  submissionsMap: Map<string, Submission>;

  firstSolvedSubmissions: Map<string, Submissions>;

  constructor(contest: Contest, teams: Teams, submissions: Submissions) {
    this.contest = contest;

    this.teams = _.cloneDeep(teams);
    this.teamsMap = new Map(this.teams.map(t => [t.id, t]));

    this.submissions = _.cloneDeep(submissions).sort(Submission.compare);
    this.submissionsMap = new Map(this.submissions.map(s => [s.id, s]));

    this.firstSolvedSubmissions = new Map(this.contest.problems.map(p => [p.id, []]));
  }

  buildRank(options?: { timestamp?: number }) {
    (() => {
      for (const t of this.teams) {
        t.problemStatistics = this.contest.problems.map((p) => {
          const ps = new TeamProblemStatistics();
          ps.problem = p;
          ps.contestPenalty = this.contest.penalty;

          return ps;
        });

        t.problemStatisticsMap = new Map(t.problemStatistics.map(ps => [ps.problem.id, ps]));
      }

      this.firstSolvedSubmissions = new Map(this.contest.problems.map(p => [p.id, []]));

      for (const s of this.submissions) {
        const teamId = s.teamId;
        const problemId = s.problemId;
        const team = this.teamsMap.get(teamId);
        const problem = this.contest.problemsMap.get(problemId);

        if (team === undefined || problem === undefined) {
          continue;
        }

        if (options?.timestamp !== undefined && options?.timestamp !== null) {
          if (s.timestamp > options.timestamp) {
            break;
          }
        }

        const problemStatistics = team.problemStatisticsMap.get(problemId) as TeamProblemStatistics;
        const submissions = problemStatistics.submissions;
        const firstSolvedSubmissions = this.firstSolvedSubmissions.get(problemId) as Array<Submission>;

        submissions.push(s);
        problem.statistics.submittedNum++;

        if (problemStatistics.isSolved) {
          continue;
        }

        if (s.isIgnore || s.isNotCalculatedPenaltyStatus()) {
          problemStatistics.ignoreCount++;
          continue;
        }

        problemStatistics.isSubmitted = true;
        problemStatistics.lastSubmitTimestamp = s.timestamp;
        problemStatistics.totalCount++;

        if (s.isAccepted()) {
          problemStatistics.isSolved = true;
          problemStatistics.solvedTimestamp = s.timestamp;

          problem.statistics.acceptedNum++;

          if (
            firstSolvedSubmissions.length === 0
            || firstSolvedSubmissions[firstSolvedSubmissions.length - 1].timestamp === s.timestamp
          ) {
            problemStatistics.isFirstSolved = true;
            firstSolvedSubmissions.push(s);
          }
        }

        if (s.isRejected()) {
          problemStatistics.failedCount++;
          problem.statistics.rejectedNum++;
        }

        if (s.isPending()) {
          problemStatistics.pendingCount++;
          problem.statistics.pendingNum++;
        }
      }

      this.teams.forEach(t => t.calcSolvedData());
      this.teams.sort(Team.compare);

      {
        let rank = 1;
        for (const t of this.teams) {
          t.rank = rank++;
        }
      }
    })();

    return this;
  }
}
