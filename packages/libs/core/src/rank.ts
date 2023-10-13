import _ from "lodash";

import type { Contest } from "./contest";
import type { Teams } from "./team";
import { Team } from "./team";
import type { Submissions } from "./submission";
import { Submission } from "./submission";
import { TeamProblemStatistics } from "./problem";
import { RankStatistics } from "./rank-statistics";
import { Balloon, type Balloons } from "./balloon";

export interface SelectOptionItem {
  value: string;
  text: string;
}

export class RankOptions {
  enableFilterSubmissionsByTimestamp: boolean;
  width: number;
  timestamp: number;

  enableFilterTeamsByGroup: boolean;
  group: string;

  filterOrganizations: Array<SelectOptionItem>;
  filterOrganizationMap: Map<string, SelectOptionItem>;
  filterTeams: Array<SelectOptionItem>;
  filterTeamMap: Map<string, SelectOptionItem>;

  constructor() {
    this.enableFilterSubmissionsByTimestamp = false;
    this.width = 0;
    this.timestamp = 0;

    this.enableFilterTeamsByGroup = false;
    this.group = "all";

    this.filterOrganizations = [];
    this.filterOrganizationMap = new Map<string, SelectOptionItem>();

    this.filterTeams = [];
    this.filterTeamMap = new Map<string, SelectOptionItem>();
  }

  setWidth(width: number, contest: Contest) {
    this.width = width;
    this.timestamp = Math.floor((contest.endTime.unix() - contest.startTime.unix()) * this.width * 0.0001);
    this.enableFilterSubmissionsByTimestamp = true;
  }

  disableFilterSubmissionByTimestamp() {
    this.enableFilterSubmissionsByTimestamp = false;
  }

  setGroup(group: string) {
    this.group = group;
    this.enableFilterTeamsByGroup = true;

    if (this.group === "all") {
      this.disableFilterTeamsByGroup();
    }
  }

  disableFilterTeamsByGroup() {
    this.enableFilterTeamsByGroup = false;
    this.group = "all";
  }

  setFilterOrganizations(filterOrganizations: Array<SelectOptionItem>) {
    const m = new Map<string, SelectOptionItem>();
    filterOrganizations.forEach((item) => {
      m.set(item.value, item);
    });

    this.filterOrganizations = filterOrganizations;
    this.filterOrganizationMap = m;
  }

  setFilterTeams(filterTeams: Array<SelectOptionItem>) {
    const m = new Map<string, SelectOptionItem>();
    filterTeams.forEach((item) => {
      m.set(item.value, item);
    });

    this.filterTeams = filterTeams;
    this.filterTeamMap = m;
  }

  isNeedReBuildRank(nextRankOptions: RankOptions): boolean {
    if (this.enableFilterSubmissionsByTimestamp !== nextRankOptions.enableFilterSubmissionsByTimestamp) {
      return true;
    }

    if (this.width !== nextRankOptions.width) {
      return true;
    }

    if (this.timestamp !== nextRankOptions.timestamp) {
      return true;
    }

    if (this.enableFilterTeamsByGroup !== nextRankOptions.enableFilterTeamsByGroup) {
      return true;
    }

    if (this.group !== nextRankOptions.group) {
      return true;
    }

    return false;
  }
}

export class Rank {
  readonly contest: Contest;

  teams: Teams;
  teamsMap: Map<string, Team>;

  submissions: Submissions;
  submissionsMap: Map<string, Submission>;

  organizations: Array<string>;
  originTeams: Teams;

  rankStatistics: RankStatistics;

  options: RankOptions;

  balloons: Balloons;

  constructor(contest: Contest, teams: Teams, submissions: Submissions) {
    this.contest = contest;

    this.teams = _.cloneDeep(teams);
    this.teamsMap = new Map(this.teams.map(t => [t.id, t]));

    this.submissions = _.cloneDeep(submissions).sort(Submission.compare);
    this.submissionsMap = new Map(this.submissions.map(s => [s.id, s]));

    this.organizations = this.buildOrganizations();
    this.originTeams = this.teams.map(t => t);
    this.originTeams.sort(Team.compare);

    this.rankStatistics = new RankStatistics();

    this.options = new RankOptions();

    this.balloons = [];
  }

  cleanRank() {
    (() => {
      this.teams = [];

      for (const [_k, v] of this.teamsMap) {
        if (this.filterTeamByOrg(v)) {
          continue;
        }

        this.teams.push(v);
      }
    })();

    for (const t of this.teams) {
      t.reset();

      t.problemStatistics = this.contest.problems.map((p) => {
        const ps = new TeamProblemStatistics();
        ps.problem = p;
        ps.contestPenalty = this.contest.penalty;

        return ps;
      });

      t.problemStatisticsMap = new Map(t.problemStatistics.map(ps => [ps.problem.id, ps]));
    }

    this.contest.problems.forEach((p) => {
      p.statistics.reset();
    });
  }

  buildRank() {
    (() => {
      this.cleanRank();

      this.teams.forEach(t =>
        t.placeChartPoints.push({
          timePoint: 0,
          rank: 1,
          lastSolvedProblem: null,
        }),
      );

      (() => {
        this.rankStatistics.reset();
        this.rankStatistics.teamSolvedNum = Array(this.contest.problems.length + 1).fill(0);
      })();

      let preSubmissionTimestampToMinute = 0;
      const allSubmissions = this.getSubmissions();

      for (let ix = 0; ix < allSubmissions.length; ix++) {
        const s = allSubmissions[ix];

        const teamId = s.teamId;
        const problemId = s.problemId;
        const team = this.teamsMap.get(teamId);
        const problem = this.contest.problemsMap.get(problemId);

        (() => {
          if (team === undefined || this.filterTeamByOrg(team) || problem === undefined) {
            return;
          }

          const problemStatistics = team.problemStatisticsMap.get(problemId) as TeamProblemStatistics;
          const submissions = problemStatistics.submissions;

          submissions.push(s);
          team.submissions.push(s);
          problem.statistics.submittedNum++;

          if (problemStatistics.isSolved) {
            return;
          }

          if (s.isIgnore || s.isNotCalculatedPenaltyStatus()) {
            problem.statistics.ignoreNum++;
            problemStatistics.ignoreCount++;
            return;
          }

          problemStatistics.isSubmitted = true;
          problemStatistics.lastSubmitTimestamp = s.timestamp;
          problemStatistics.totalCount++;

          if (s.isAccepted()) {
            problemStatistics.isSolved = true;
            problemStatistics.solvedTimestamp = s.timestamp;

            problem.statistics.acceptedNum++;
            problem.statistics.attemptedNum += problemStatistics.failedCount + 1;

            if (
              problem.statistics.firstSolveSubmissions.length === 0
              || problem.statistics.firstSolveSubmissions[problem.statistics.firstSolveSubmissions.length - 1].timestamp === s.timestamp
            ) {
              problemStatistics.isFirstSolved = true;
              problem.statistics.firstSolveSubmissions.push(s);
            }

            while (problem.statistics.lastSolveSubmissions.length > 0) {
              problem.statistics.lastSolveSubmissions.pop();
            }

            problem.statistics.lastSolveSubmissions.push(s);

            team.lastSolvedProblem = problem;
            team.lastSolvedProblemTimestamp = s.timestamp;
          }

          if (s.isRejected()) {
            problemStatistics.failedCount++;
            problem.statistics.rejectedNum++;
          }

          if (s.isPending()) {
            problemStatistics.pendingCount++;
            problem.statistics.pendingNum++;
          }
        })();

        if (s.timestampToMinute > preSubmissionTimestampToMinute || ix === allSubmissions.length - 1) {
          this.teams.forEach(t => t.calcSolvedData());
          this.teams.sort(Team.compare);
          this.buildTeamRank();

          this.teams.forEach(t =>
            t.placeChartPoints.push(
              {
                timePoint: s.timestampToMinute,
                rank: t.rank,
                lastSolvedProblem: t.lastSolvedProblem,
              },
            ),
          );
        }

        preSubmissionTimestampToMinute = s.timestampToMinute;
      }

      this.teams.forEach(t => t.calcSolvedData());
      this.teams.sort(Team.compare);
      this.buildTeamRank();
      this.buildOrgRank();

      this.teams.forEach(t => t.calcAwards(this.contest.awards?.get(this.options.group)));
      this.teams.forEach(t => t.postProcessPlaceChartPoints());
    })();

    (() => {
      for (const t of this.teams) {
        this.rankStatistics.teamSolvedNum[t.solvedProblemNum]++;
      }

      if (this.teams.length > 0) {
        this.rankStatistics.maxSolvedProblems = this.teams[0].solvedProblemNum;
      }
    })();

    return this;
  }

  buildTeamRank() {
    let rank = 1;
    let originalRank = 1;
    let preTeam = null;
    for (const t of this.teams) {
      t.rank = rank++;
      t.originalRank = originalRank++;

      if (preTeam !== null) {
        if (t.isEqualRank(preTeam)) {
          t.rank = preTeam.rank;
        }
      }

      preTeam = t;
    }
  }

  buildOrgRank() {
    if (!this.contest.organization) {
      return;
    }

    let rank = 1;
    let preTeam = null;

    const se = new Set<string>();

    for (const t of this.teams) {
      const org = t.organization;
      if (se.has(org)) {
        continue;
      }

      se.add(org);
      t.organizationRank = rank++;

      if (preTeam !== null) {
        if (t.isEqualRank(preTeam)) {
          t.organizationRank = preTeam.organizationRank;
        }
      }

      preTeam = t;
    }
  }

  buildOrganizations() {
    if (!this.contest.organization) {
      return [];
    }

    const res = new Array<string>();
    const se = new Set<string>();

    this.teams.forEach((t) => {
      const org = t.organization;
      if (se.has(org)) {
        return;
      }

      res.push(org);
      se.add(org);
    });

    res.sort();

    return res;
  }

  filterTeamByOrg(team: Team) {
    const o = this.options;

    if (o.enableFilterTeamsByGroup) {
      if (!team.group?.includes(o.group)) {
        return true;
      }
    }

    return false;
  }

  getSubmissions() {
    if (this.options.enableFilterSubmissionsByTimestamp === false) {
      return this.submissions;
    }

    return this.submissions.filter(s =>
      s.timestamp <= this.options.timestamp,
    ).sort(Submission.compare);
  }

  buildBalloons() {
    this.balloons = [];
    this.cleanRank();

    const allSubmissions = this.getSubmissions();

    for (let ix = 0; ix < allSubmissions.length; ix++) {
      const s = allSubmissions[ix];

      const teamId = s.teamId;
      const problemId = s.problemId;
      const team = this.teamsMap.get(teamId);
      const problem = this.contest.problemsMap.get(problemId);

      (() => {
        if (team === undefined || problem === undefined) {
          return;
        }

        const problemStatistics = team.problemStatisticsMap.get(problemId) as TeamProblemStatistics;

        if (problemStatistics.isSolved) {
          return;
        }

        if (s.isAccepted()) {
          problemStatistics.isSolved = true;
          problemStatistics.solvedTimestamp = s.timestamp;

          const b = new Balloon();
          b.team = team;
          b.problem = problem;
          b.submission = s;

          this.balloons.push(b);
        }
      })();
    }
  }
}
