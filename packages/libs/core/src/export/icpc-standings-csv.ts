import type { Rank } from "../rank";
import type { Team } from "../team";

import _ from "lodash";
import ordinal from "ordinal";
import Papa from "papaparse";

import { isValidMedalType } from "../award";

interface ICPCTeamResult {
  teamId: string;
  rank: number;
  medalCitation: string;
  problemsSolved: number;
  totalTime: number;
  lastProblemTime: number;
  siteCitation: string;
  citation: string;
  teamName: string;
  institution: string;
}

export class ICPCStandingsCsvConverter {
  constructor() {}

  public convert(oriRank: Rank) {
    const rank = _.cloneDeep(oriRank);

    rank.options.disableFilterTeamsByGroup();
    rank.options.disableFilterSubmissionByTimestamp();

    rank.options.setGroup("official");
    rank.buildRank();

    const resList: Array<ICPCTeamResult> = [];

    for (const team of rank.teams) {
      const res: ICPCTeamResult = {
        teamId: team.icpcID ?? "",
        rank: team.rank,
        medalCitation: this.getMedalCitation(team),
        problemsSolved: team.solvedProblemNum,
        totalTime: team.penaltyToMinute,
        lastProblemTime: team.lastSolvedProblemStatistics?.solvedTimestampToMinute ?? 0,
        siteCitation: "",
        citation: ordinal(team.rank),
        teamName: team.name.getOrDefault(),
        institution: team.organization?.name.getOrDefault() ?? "",
      };

      resList.push(res);
    }

    const csv = Papa.unparse(resList);

    return csv;
  }

  private getMedalCitation(team: Team): string {
    if (team.solvedProblemNum === 0) {
      return "";
    }

    const medals = team.awards
      .filter(a => isValidMedalType(a))
      .map(a => a.toString());

    if (medals.length === 1) {
      const medal = medals[0];
      if (medal === "Gold") {
        return "Gold Medal";
      }

      if (medal === "Silver") {
        return "Silver Medal";
      }

      if (medal === "Bronze") {
        return "Bronze Medal";
      }

      if (medal === "Honorable") {
        return "Honorable Mention";
      }
    }

    return "";
  }
}
