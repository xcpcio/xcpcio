import { Team as ITeam, Teams as ITeams } from "@xcpcio/types";

import { TeamProblemStatistics } from "./problem";

export class Team {
  id: string;
  name: string;
  organization: string;

  group: Array<string>;
  tag: Array<string>;

  coach?: string | Array<string>;
  members?: string | Array<string>;

  rank: number;
  solvedProblemNum: number;
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
    this.solvedProblemNum = 0;
    this.penalty = 0;

    this.problemStatistics = [];
    this.problemStatisticsMap = new Map<string, TeamProblemStatistics>();
  }

  penaltyToMinute() {
    return Math.floor(this.penalty / 60);
  }
}

export type Teams = Array<Team>;

export function createTeam(teamJSON: ITeam): Team {
  const t = new Team();

  t.id = teamJSON.id ?? teamJSON.team_id ?? "";
  t.name = teamJSON.name ?? teamJSON.team_name ?? "";

  t.organization = teamJSON.organization ?? "";
  t.group = teamJSON.group ?? [];
  t.tag = teamJSON.group ?? [];

  t.coach = teamJSON.coach;
  t.members = teamJSON.members;

  if (teamJSON.official === true) {
    t.group.push("official");
  }

  if (teamJSON.unofficial === true) {
    t.group.push("unofficial");
  }

  if (teamJSON.girl === true) {
    t.group.push("girl");
  }

  t.group = [...new Set(t.group)];
  t.group.sort();

  return t;
}

export function createTeams(teamsJSON: ITeams): Teams {
  if (Array.isArray(teamsJSON)) {
    return teamsJSON.map((t) => createTeam(t));
  } else {
    const teams = Object.entries(teamsJSON).map(([teamId, team]) =>
      createTeam({ ...team, team_id: team.team_id ?? teamId }),
    );
    return teams;
  }
}
