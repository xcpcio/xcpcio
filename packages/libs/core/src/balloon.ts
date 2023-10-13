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
}

export type Balloons = Array<Balloon>;
