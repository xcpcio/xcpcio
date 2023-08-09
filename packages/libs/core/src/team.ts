import type { Team as ITeam, Teams as ITeams, Image } from "@xcpcio/types";

import type { TeamProblemStatistics } from "./problem";
import { calcDict } from "./utils";

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
  organizationRank: number;

  solvedProblemNum: number;
  attemptedProblemNum: number;

  penalty: number;

  problemStatistics: Array<TeamProblemStatistics>;
  problemStatisticsMap: Map<string, TeamProblemStatistics>;

  constructor() {
    this.id = "";
    this.name = "";

    this.organization = "";

    this.group = [];
    this.tag = [];

    this.rank = 0;
    this.organizationRank = -1;

    this.solvedProblemNum = 0;
    this.attemptedProblemNum = 0;

    this.penalty = 0;

    this.problemStatistics = [];
    this.problemStatisticsMap = new Map<string, TeamProblemStatistics>();
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
    this.penalty = 0;
    this.attemptedProblemNum = 0;

    for (const p of this.problemStatistics) {
      if (p.isAccepted) {
        this.solvedProblemNum++;
        this.attemptedProblemNum += p.failedCount + 1;

        this.penalty += p.penalty;
      }
    }
  }

  static compare(lhs: Team, rhs: Team): number {
    if (lhs.solvedProblemNum !== rhs.solvedProblemNum) {
      return rhs.solvedProblemNum - lhs.solvedProblemNum;
    }

    if (lhs.penalty !== rhs.penalty) {
      return lhs.penalty - rhs.penalty;
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
