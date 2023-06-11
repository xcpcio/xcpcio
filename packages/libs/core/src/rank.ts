import { Contest } from "./contest";
import { Teams } from "./team";
import { Submissions } from "./submission";

export class Rank {
  contest: Contest;
  teams: Teams;
  submissions: Submissions;

  constructor(contest: Contest, teams: Teams, submissions: Submissions) {
    this.contest = contest;
    this.teams = teams;
    this.submissions = submissions;
  }
}
