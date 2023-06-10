import { Team as ITeam, Teams as ITeams } from "@xcpcio/types";

export class Team {
  teamId!: string;
  teamName!: string;

  organization?: string;
  group!: Array<string>;
  tag!: Array<string>;

  coach?: string | Array<string>;
  members?: string | Array<string>;
}

export type Teams = Array<Team>;

export function createTeam(teamJSON: ITeam): Team {
  const t = new Team();

  t.teamId = teamJSON.team_id ?? "";
  t.teamName = teamJSON.name ?? teamJSON.team_name ?? "";

  t.organization = teamJSON.organization;
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
