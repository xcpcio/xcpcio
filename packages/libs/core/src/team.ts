import type { Team as ITeam, Teams as ITeams, Image } from "@xcpcio/types";

import type { Problem, TeamProblemStatistics } from "./problem";
import { calcDict } from "./utils";
import type { Submissions } from "./submission";
import type { Award, MedalType } from "./award";

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
  lastSolvedProblemTimestamp: number;

  penalty: number;

  problemStatistics: Array<TeamProblemStatistics>;
  problemStatisticsMap: Map<string, TeamProblemStatistics>;

  submissions: Submissions;

  placeChartPoints: Array<PlaceChartPointData>;

  awards: MedalType[];

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
    this.lastSolvedProblemTimestamp = 0;

    this.penalty = 0;

    this.problemStatistics = [];
    this.problemStatisticsMap = new Map<string, TeamProblemStatistics>();

    this.submissions = [];

    this.placeChartPoints = [];

    this.awards = [];
  }

  reset() {
    this.rank = 0;
    this.originalRank = 0;
    this.organizationRank = -1;

    this.solvedProblemNum = 0;
    this.attemptedProblemNum = 0;

    this.lastSolvedProblem = null;
    this.lastSolvedProblemTimestamp = 0;

    this.penalty = 0;

    this.problemStatistics = [];
    this.problemStatisticsMap = new Map<string, TeamProblemStatistics>();

    this.submissions = [];

    this.placeChartPoints = [];
  }

  get penaltyToMinute() {
    return Math.floor(this.penalty / 60);
  }

  get dict() {
    const attemptedNum = this.attemptedProblemNum;
    const solvedNum = this.solvedProblemNum;

    return calcDict(attemptedNum, solvedNum);
  }

  calcSolvedData() {
    this.solvedProblemNum = 0;
    this.attemptedProblemNum = 0;

    this.penalty = 0;

    for (const p of this.problemStatistics) {
      if (p.isAccepted) {
        this.solvedProblemNum++;
        this.attemptedProblemNum += p.failedCount + 1;

        this.penalty += p.penalty;
      }
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

    if (lhs.lastSolvedProblemTimestamp !== rhs.lastSolvedProblemTimestamp) {
      return lhs.lastSolvedProblemTimestamp - rhs.lastSolvedProblemTimestamp;
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

  t.group = teamJSON.group ?? [];
  t.tag = teamJSON.group ?? [];

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
