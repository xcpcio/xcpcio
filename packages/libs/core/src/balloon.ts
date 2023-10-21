import { Problem } from "./problem";
import { Team } from "./team";
import { Submission } from "./submission";

export class Balloon {
  problem: Problem;
  team: Team;
  submission: Submission;

  constructor() {
    this.problem = new Problem();
    this.team = new Team();
    this.submission = new Submission();
  }

  get key() {
    return `balloon-${this.team.id}-${this.problem.id}`;
  }
}

export type Balloons = Array<Balloon>;
