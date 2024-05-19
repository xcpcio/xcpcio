import _ from "lodash";

import type { Team as ITeam, Teams as ITeams, Image } from "@xcpcio/types";

import type { Problem, TeamProblemStatistics } from "./problem";
import { calcDirt } from "./utils";
import type { Submissions } from "./submission";
import type { Award, MedalType } from "./award";
import type { ContestOptions } from "./contest-options";

export class PlaceChartPointData {
  timePoint: number;
  rank: number;
  lastSolvedProblem: Problem | null;

  constructor() {
    this.timePoint = 0;
    this.rank = 0;
    this.lastSolvedProblem = null;
  }
}

export class Team {
  id: string;
  name: string;

  organization: string;
  badge?: Image;

  group: Array<string>;
  tag: Array<string>;

  coach?: string | Array<string>;
  members?: string | Array<string>;

  rank: number;
  originalRank: number;
  organizationRank: number;

  solvedProblemNum: number;
  attemptedProblemNum: number;

  lastSolvedProblem: Problem | null;
  lastSolvedProblemStatistics: TeamProblemStatistics | null;

  penalty: number;

  problemStatistics: Array<TeamProblemStatistics>;
  problemStatisticsMap: Map<string, TeamProblemStatistics>;

  submissions: Submissions;

  placeChartPoints: Array<PlaceChartPointData>;

  awards: MedalType[];

  location?: string;
  icpcID?: string;

  se: number;

  constructor() {
    this.id = "";
    this.name = "";

    this.organization = "";

    this.group = [];
    this.tag = [];

    this.rank = 0;
    this.originalRank = 0;
    this.organizationRank = -1;

    this.solvedProblemNum = 0;
    this.attemptedProblemNum = 0;

    this.lastSolvedProblem = null;
    this.lastSolvedProblemStatistics = null;

    this.penalty = 0;

    this.problemStatistics = [];
    this.problemStatisticsMap = new Map<string, TeamProblemStatistics>();

    this.submissions = [];

    this.placeChartPoints = [];

    this.awards = [];

    this.se = 0;
  }

  reset() {
    this.rank = 0;
    this.originalRank = 0;
    this.organizationRank = -1;

    this.solvedProblemNum = 0;
    this.attemptedProblemNum = 0;

    this.lastSolvedProblem = null;
    this.lastSolvedProblemStatistics = null;

    this.penalty = 0;

    this.problemStatistics = [];
    this.problemStatisticsMap = new Map<string, TeamProblemStatistics>();

    this.submissions = [];

    this.placeChartPoints = [];

    this.awards = [];

    this.se = 0;
  }

  get penaltyToMinute() {
    return Math.floor(this.penalty / 60);
  }

  get isUnofficial() {
    return this.group.includes("unofficial");
  }

  get isGirl() {
    return this.group.includes("girl");
  }

  get membersToArray() {
    if (Array.isArray(this.members)) {
      return this.members;
    }

    if (typeof this.members === "string") {
      if (this.members.includes(", ")) {
        return this.members.split(", ");
      }

      if (this.members.includes("、")) {
        return this.members.split("、");
      }
    }

    return [];
  }

  get membersToString() {
    if (typeof this.members === "string") {
      return this.members;
    }

    return this.members?.join(", ");
  }

  get isEffectiveTeam() {
    return this.solvedProblemNum > 0;
  }

  get dirt() {
    const attemptedNum = this.attemptedProblemNum;
    const solvedNum = this.solvedProblemNum;

    return calcDirt(attemptedNum, solvedNum);
  }

  calcSE(totalTeams: number) {
    let acceptedProblemNums = 0;
    let total = 0;

    this.problemStatistics.forEach((p) => {
      if (p.isSolved) {
        acceptedProblemNums += 1;
        total += p.problem.statistics.acceptedNum;
      }
    });

    if (totalTeams === 0 || acceptedProblemNums === 0) {
      return 0;
    }

    const res = (acceptedProblemNums * totalTeams - total) / totalTeams / acceptedProblemNums;
    this.se = Math.round(res * 100) / 100;

    return this.se;
  }

  calcSolvedData(options: ContestOptions) {
    this.solvedProblemNum = 0;
    this.attemptedProblemNum = 0;

    this.penalty = 0;

    for (const p of this.problemStatistics) {
      if (p.isAccepted) {
        this.solvedProblemNum++;
        this.attemptedProblemNum += p.failedCount + 1;

        if (options?.calculationOfPenalty === "in_seconds"
         || options?.calculationOfPenalty === "accumulate_in_seconds_and_finally_to_the_minute") {
          this.penalty += p.penaltyInSecond;
        } else {
          this.penalty += p.penalty;
        }
      }
    }

    if (options?.calculationOfPenalty === "accumulate_in_seconds_and_finally_to_the_minute") {
      this.penalty = Math.floor(this.penalty / 60) * 60;
    }
  }

  calcAwards(awards?: Award[]) {
    if (!awards) {
      return;
    }

    for (const award of awards) {
      if (this.rank >= award.minRank && this.rank <= award.maxRank) {
        this.awards.push(award.medalType);
      }
    }
  }

  isEqualRank(otherTeam: Team) {
    return this.solvedProblemNum === otherTeam.solvedProblemNum && this.penalty === otherTeam.penalty;
  }

  postProcessPlaceChartPoints() {
    if (this.placeChartPoints.length === 0) {
      return;
    }

    const res = [];
    res.push(this.placeChartPoints[0]);

    for (let i = 1; i < this.placeChartPoints.length - 1; i++) {
      const p = this.placeChartPoints[i];
      const preP = res[res.length - 1];

      if (p.rank !== preP.rank || p.lastSolvedProblem !== preP.lastSolvedProblem) {
        res.push(p);
      }
    }

    if (this.placeChartPoints.length > 1) {
      res.push(this.placeChartPoints[this.placeChartPoints.length - 1]);
    }

    this.placeChartPoints = res;
  }

  static compare(lhs: Team, rhs: Team): number {
    if (lhs.solvedProblemNum !== rhs.solvedProblemNum) {
      return rhs.solvedProblemNum - lhs.solvedProblemNum;
    }

    if (lhs.penalty !== rhs.penalty) {
      return lhs.penalty - rhs.penalty;
    }

    if (lhs.lastSolvedProblemStatistics && rhs.lastSolvedProblemStatistics) {
      return lhs.lastSolvedProblemStatistics.solvedTimestampToMinute - rhs.lastSolvedProblemStatistics.solvedTimestampToMinute;
    }

    if (lhs.name < rhs.name) {
      return -1;
    } else if (lhs.name > rhs.name) {
      return 1;
    }

    return 0;
  }
}

export type Teams = Array<Team>;

export function createTeam(teamJSON: ITeam): Team {
  const t = new Team();

  t.id = teamJSON.id ?? teamJSON.team_id ?? "";
  t.name = teamJSON.name ?? teamJSON.team_name ?? "";

  t.organization = teamJSON.organization ?? "";
  t.badge = teamJSON.badge;

  t.group = _.cloneDeep(teamJSON.group ?? []);
  t.tag = _.cloneDeep(teamJSON.tag ?? []);

  t.coach = teamJSON.coach;
  t.members = teamJSON.members;

  if (Boolean(teamJSON.official) === true) {
    t.group.push("official");
  }

  if (Boolean(teamJSON.unofficial) === true) {
    t.group.push("unofficial");
  }

  if (Boolean(teamJSON.girl) === true) {
    t.group.push("girl");
  }

  {
    const tt: any = teamJSON as any;
    for (const key of Object.keys(tt)) {
      if (tt[key] === 1 || tt[key] === true) {
        t.group.push(key);
      }
    }
  }

  t.group = [...new Set(t.group)];
  t.group.sort();

  if (teamJSON.location) {
    t.location = teamJSON.location;
  }

  if (teamJSON.icpc_id) {
    t.icpcID = teamJSON.icpc_id;
  }

  return t;
}

export function createTeams(teamsJSON: ITeams): Teams {
  if (Array.isArray(teamsJSON)) {
    return teamsJSON.map(t => createTeam(t));
  } else {
    const teams = Object.entries(teamsJSON).map(([teamId, team]) =>
      createTeam({ ...team, team_id: team.team_id ?? teamId }),
    );
    return teams;
  }
}
