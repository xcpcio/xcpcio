import { Contest } from "./contest";
import { Teams } from "./team";
import { Submissions } from "./submission";

export class Rank {
  contest: Contest;
  teams: Teams;
  submissions: Submissions;

  constructor() {
    this.contest = new Contest();
    this.teams = [];
    this.submissions = [];
  }
}
