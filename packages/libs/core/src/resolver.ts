import { Rank } from "./rank";

import { Contest } from "./contest";
import { Teams } from "./team";
import { Submissions } from "./submission";

export class Resolver extends Rank {
  constructor(contest: Contest, teams: Teams, submissions: Submissions) {
    super(contest, teams, submissions);
  }
}
