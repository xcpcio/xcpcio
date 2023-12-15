import _ from "lodash";

import type { SubmissionStatus } from "@xcpcio/types";

import type { Contest } from "./contest";
import type { Teams } from "./team";
import { Team } from "./team";
import type { Submissions } from "./submission";
import { Submission } from "./submission";
import { TeamProblemStatistics } from "./problem";
import { RankStatistics } from "./rank-statistics";
import { Balloon, type Balloons } from "./balloon";
import { Award, MedalType } from "./award";

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

  enableAnimatedSubmissions: boolean;

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

    this.enableAnimatedSubmissions = false;
  }

  setWidth(width: number, contest: Contest) {
    this.width = width;
    this.timestamp = Math.floor((contest.getEndTime().unix() - contest.getStartTime().unix()) * this.width * 0.0001);
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

  languages: Array<string>;
  statuses: Array<SubmissionStatus>;

  constructor(contest: Contest, teams: Teams, submissions: Submissions) {
    this.contest = contest;

    this.teams = _.cloneDeep(teams);
    this.teamsMap = new Map(this.teams.map(t => [t.id, t]));

    this.submissions = _.cloneDeep(submissions).sort(Submission.compare);

    {
      const o = this.contest.options;
      const timestampUnit = _.cloneDeep(o.submissionTimestampUnit);
      this.submissions.forEach((s) => {
        s.timestampUnit = timestampUnit;

        if (s.time) {
          o.submissionHasTimeField = true;
        }

        if (s.language) {
          o.submissionHasLanguageField = true;
        }
      });
    }

    this.submissionsMap = new Map(this.submissions.map(s => [s.id, s]));

    this.organizations = this.buildOrganizations();
    this.originTeams = this.teams.map(t => t);
    this.originTeams.sort(Team.compare);

    this.rankStatistics = new RankStatistics();

    this.options = new RankOptions();

    this.balloons = [];

    {
      const se = new Set<string>();

      this.submissions.forEach((s) => {
        if (s.language) {
          se.add(s.language);
        }
      });

      this.languages = [...se].sort();
    }

    {
      const se = new Set<SubmissionStatus>();

      this.submissions.forEach((s) => {
        se.add(s.status);
      });

      this.statuses = [...se].sort();
    }
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
        this.rankStatistics.teamSolvedNumIndex = Array(this.contest.problems.length + 1).fill(0);
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
            s.isSolved = false;
            s.isFirstSolved = false;
            return;
          }

          if (s.isIgnore || s.isNotCalculatedPenaltyStatus()) {
            problem.statistics.ignoreNum++;
            problemStatistics.ignoreCount++;
            return;
          }

          problemStatistics.isSubmitted = true;
          problemStatistics.lastSubmitTimestamp = s.timestampToSecond;
          problemStatistics.totalCount++;

          if (s.isAccepted()) {
            s.isSolved = true;

            problemStatistics.isSolved = true;
            problemStatistics.solvedTimestamp = s.timestampToSecond;

            problem.statistics.acceptedNum++;
            problem.statistics.attemptedNum += problemStatistics.failedCount + 1;

            if (
              problem.statistics.firstSolveSubmissions.length === 0
              || problem.statistics.firstSolveSubmissions[problem.statistics.firstSolveSubmissions.length - 1].timestamp === s.timestamp
            ) {
              s.isFirstSolved = true;
              problemStatistics.isFirstSolved = true;
              problem.statistics.firstSolveSubmissions.push(s);
            }

            while (problem.statistics.lastSolveSubmissions.length > 0) {
              problem.statistics.lastSolveSubmissions.pop();
            }

            problem.statistics.lastSolveSubmissions.push(s);

            team.lastSolvedProblem = problem;
            team.lastSolvedProblemStatistics = problemStatistics;
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
          this.teams.forEach(t => t.calcSolvedData(this.contest.options));
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

      this.teams.forEach(t => t.calcSolvedData(this.contest.options));
      this.teams.sort(Team.compare);
      this.buildTeamRank();
      this.buildOrgRank();

      this.rankStatistics.effectiveTeamNum = this.teams.filter(t => t.isEffectiveTeam).length;
      this.rankStatistics.totalTeamNum = this.teams.length;
      this.teams.forEach(t => t.calcSE(this.rankStatistics.totalTeamNum));
      this.contest.problems.forEach(p => p.statistics.calcSE(this.rankStatistics.totalTeamNum));
      this.buildAwards();

      this.teams.forEach(t => t.calcAwards(this.contest.awards?.get(this.options.group)));
      this.teams.forEach(t => t.postProcessPlaceChartPoints());
    })();

    (() => {
      for (const t of this.teams) {
        this.rankStatistics.teamSolvedNum[t.solvedProblemNum]++;
      }

      {
        let current = 0;
        const teamSolvedNum = this.rankStatistics.teamSolvedNum;
        const teamSolvedNumIndex = this.rankStatistics.teamSolvedNumIndex;

        for (let i = teamSolvedNumIndex.length - 1; i >= 0; i--) {
          current += (teamSolvedNum[i] > 0 ? 1 : 0);
          teamSolvedNumIndex[i] = current;
        }
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

  buildAwards() {
    if (this.contest.medal === "ccpc") {
      this.contest.awards = new Map<string, Award[]>();

      const tot = this.rankStatistics.effectiveTeamNum;
      const award: Award[] = [];

      const gold = new Award();
      const silver = new Award();
      const bronze = new Award();
      const honorable = new Award();

      {
        gold.medalType = MedalType.GOLD;
        gold.minRank = 1;
        gold.maxRank = Math.ceil(tot * 0.1);
        if (gold.maxRank >= gold.minRank) {
          award.push(gold);
        }
      }

      {
        silver.medalType = MedalType.SILVER;
        silver.minRank = gold.maxRank + 1;
        silver.maxRank = Math.ceil(tot * 0.3);
        if (silver.maxRank >= silver.minRank) {
          award.push(silver);
        }
      }

      {
        bronze.medalType = MedalType.BRONZE;
        bronze.minRank = silver.maxRank + 1;
        bronze.maxRank = Math.ceil(tot * 0.6);
        if (bronze.maxRank >= bronze.minRank) {
          award.push(bronze);
        }
      }

      {
        honorable.medalType = MedalType.HONORABLE;
        honorable.minRank = bronze.maxRank + 1;
        this.teams.forEach((t) => {
          if (t.solvedProblemNum > 0) {
            honorable.maxRank = Math.max(honorable.maxRank, t.rank);
          }
        });
        if (honorable.maxRank >= honorable.minRank) {
          award.push(honorable);
        }
      }

      this.contest.awards.set("official", award);
    }
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
    if (this.contest.replayContestStartTimestamp === undefined && this.options.enableFilterSubmissionsByTimestamp === false) {
      return this.submissions;
    }

    return this.submissions.filter((s) => {
      if (this.contest.replayContestStartTimestamp !== undefined) {
        if (s.timestampToSecond > this.contest.replayContestStartTimestamp) {
          return false;
        }
      }

      if (this.options.enableFilterSubmissionsByTimestamp) {
        if (s.timestampToSecond > this.options.timestamp) {
          return false;
        }
      }

      return true;
    });
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
          problemStatistics.solvedTimestamp = s.timestampToSecond;

          const b = new Balloon();
          b.team = team;
          b.problem = problem;
          b.submission = s;

          this.balloons.push(b);
        }
      })();
    }
  }

  setReplayTime(replayStartTimestamp: number) {
    this.contest.setReplayTime(replayStartTimestamp);
  }
}
