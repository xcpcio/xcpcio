import { Team, Person } from "@/types/team";

export interface TeamInstance {
  id: string;
  name: string;
  coach?: Person | Person[];
  members?: Person | Person[];
  organization?: string;
  group?: string[];
  tag?: string[];
}

export function createTeam(rawTeamJSON: Team): TeamInstance {
  return rawTeamJSON;
}

export function createTeams(rawTeamsJSON: Record<string, Team>): Record<string, TeamInstance> {
  let teams: Record<string, TeamInstance> = {};

  for (const teamID in rawTeamsJSON) {
    teams[teamID] = createTeam(rawTeamsJSON[teamID]);
  }

  return teams;
}
