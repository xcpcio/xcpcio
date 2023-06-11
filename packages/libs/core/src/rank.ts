import { Contest } from "./contest";
import { Team, Teams } from "./team";
import { Submission, Submissions } from "./submission";

export class Rank {
  contest: Contest;
  teams: Teams;
  submissions: Submissions;
  teamsMap: Map<string, Team>;
  submissionsMap: Map<string, Submission>;

  constructor(contest: Contest, teams: Teams, submissions: Submissions) {
    this.contest = contest;
    this.teams = teams;
    this.submissions = submissions;

    this.teamsMap = new Map<string, Team>();
    this.submissionsMap = new Map<string, Submission>();

    for (const t of this.teams) {
      this.teamsMap.set(t.id, t);
    }

    for (const s of this.submissions) {
      this.submissionsMap.set(s.id, s);
    }
  }

  buildRank(options: { timestamp?: number }) {
    (() => {
      for (const s of this.submissions) {
        if (s.isIgnore === true) {
          continue;
        }

        if (options.timestamp !== undefined && options.timestamp !== null) {
          if (s.timestamp > options.timestamp) {
            return;
          }
        }
      }
    })();
  }
}
