import { TeamProblemStatistics } from "./problem";
import { Team } from "./team";

export class ResolverOperation {
  id: number;

  team: Team;
  problemIx: number;

  beforeTeamProblemStatistics: TeamProblemStatistics;
  afterTeamProblemStatistics: TeamProblemStatistics;

  constructor() {
    this.id = 0;

    this.team = new Team();
    this.problemIx = 0;

    this.beforeTeamProblemStatistics = new TeamProblemStatistics();
    this.afterTeamProblemStatistics = new TeamProblemStatistics();
  }
}
