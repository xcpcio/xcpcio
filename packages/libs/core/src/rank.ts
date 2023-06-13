import { Contest } from "./contest";
import { Team, Teams } from "./team";
import { Submission, Submissions } from "./submission";
import { TeamProblemStatistics } from "./problem";

export class Rank {
  contest: Contest;

  teams: Teams;
  teamsMap: Map<string, Team>;

  submissions: Submissions;
  submissionsMap: Map<string, Submission>;

  firstSolvedSubmissions: Map<string, Array<Submission>>;

  constructor(contest: Contest, teams: Teams, submissions: Submissions) {
    this.contest = contest;

    this.teams = teams;
    this.teamsMap = new Map(this.teams.map((t) => [t.id, t]));

    this.submissions = submissions.sort((a, b) => {
      if (a.timestamp !== b.timestamp) {
        return a.timestamp - b.timestamp;
      }

      if (a.teamId === b.teamId) {
        if (a.isAccepted() && !b.isAccepted()) {
          return -1;
        }

        if (!a.isAccepted() && b.isAccepted()) {
          return 1;
        }
      }

      return 0;
    });
    this.submissionsMap = new Map(this.submissions.map((s) => [s.id, s]));

    this.firstSolvedSubmissions = new Map(this.contest.problems.map((p) => [p.id, []]));
  }

  buildRank(options?: { timestamp?: number }) {
    (() => {
      for (const t of this.teams) {
        t.problemStatistics = this.contest.problems.map((p) => {
          const ps = new TeamProblemStatistics();
          ps.problem = p;

          return ps;
        });

        t.problemStatisticsMap = new Map(t.problemStatistics.map((ps) => [ps.problem.id, ps]));
      }

      this.firstSolvedSubmissions = new Map(this.contest.problems.map((p) => [p.id, []]));

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

        if (s.isAccepted()) {
          problemStatistics.isSolved = true;
          problemStatistics.solvedTimestamp = s.timestamp;

          problem.statistics.acceptedNum++;

          if (
            firstSolvedSubmissions.length === 0 ||
            firstSolvedSubmissions[firstSolvedSubmissions.length - 1].timestamp === s.timestamp
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

      for (const t of this.teams) {
        t.solvedProblemNum = 0;
        t.penalty = 0;

        for (const p of t.problemStatistics) {
          if (p.isSolved) {
            t.solvedProblemNum++;
            t.penalty += Math.floor(p.solvedTimestamp / 60) * 60;
            t.penalty += p.failedCount * this.contest.penalty;
          }
        }
      }

      this.teams.sort((a, b) => {
        if (a.solvedProblemNum !== b.solvedProblemNum) {
          return b.solvedProblemNum - a.solvedProblemNum;
        }

        if (a.penalty !== b.penalty) {
          return a.penalty - b.penalty;
        }

        if (a.name < b.name) {
          return -1;
        } else if (a.name > b.name) {
          return 1;
        }

        return 0;
      });

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
