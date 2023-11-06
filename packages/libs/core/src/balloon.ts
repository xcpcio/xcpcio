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

  static compare(lhs: Balloon, rhs: Balloon): number {
    return Submission.compare(lhs.submission, rhs.submission);
  }
}

export type Balloons = Array<Balloon>;
