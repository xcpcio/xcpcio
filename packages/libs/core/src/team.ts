import type { Image, Team as ITeam, Teams as ITeams, Lang } from "@xcpcio/types";

import type { Award, MedalType } from "./award";
import type { ContestOptions } from "./contest-options";
import type { Organization } from "./organization";
import type { Persons } from "./person";
import type { Problem, TeamProblemStatistics } from "./problem";

import type { Submissions } from "./submission";
import _ from "lodash";
import { I18nText } from "./basic-types";
import { createPersons } from "./person";
import { calcDirt } from "./utils";

export class PlaceChartPointData {
  timePoint: number;
  rank: number;
  lastSolvedProblem: Problem | null;

  constructor() {
    this.timePoint = 0;
    this.rank = 0;
    this.lastSolvedProblem = null;
  }
}

export class Team {
  id: string;
  name: I18nText;

  organizationId?: string;
  organizationName?: string;
  organization?: Organization;
  isFirstRankOfOrganization: boolean;

  group: Array<string>;
  tag: Array<string>;

  coaches: Persons;
  members: Persons;

  rank: number;
  originalRank: number;

  solvedProblemNum: number;
  attemptedProblemNum: number;

  lastSolvedProblem: Problem | null;
  lastSolvedProblemStatistics: TeamProblemStatistics | null;

  penalty: number;

  problemStatistics: Array<TeamProblemStatistics>;
  problemStatisticsMap: Map<string, TeamProblemStatistics>;

  submissions: Submissions;

  placeChartPoints: Array<PlaceChartPointData>;

  awards: MedalType[];

  badge?: Image;

  missingPhoto: boolean;
  photo?: Image;

  location?: string;
  icpcID?: string;

  ip?: string;

  se: number;

  constructor() {
    this.id = "";
    this.name = new I18nText();

    this.isFirstRankOfOrganization = false;

    this.group = [];
    this.tag = [];

    this.coaches = [];
    this.members = [];

    this.rank = 0;
    this.originalRank = 0;

    this.solvedProblemNum = 0;
    this.attemptedProblemNum = 0;

    this.lastSolvedProblem = null;
    this.lastSolvedProblemStatistics = null;

    this.penalty = 0;

    this.problemStatistics = [];
    this.problemStatisticsMap = new Map<string, TeamProblemStatistics>();

    this.submissions = [];

    this.placeChartPoints = [];

    this.awards = [];

    this.missingPhoto = false;

    this.se = 0;
  }

  reset() {
    this.isFirstRankOfOrganization = false;

    this.rank = 0;
    this.originalRank = 0;

    this.solvedProblemNum = 0;
    this.attemptedProblemNum = 0;

    this.lastSolvedProblem = null;
    this.lastSolvedProblemStatistics = null;

    this.penalty = 0;

    this.problemStatistics = [];
    this.problemStatisticsMap = new Map<string, TeamProblemStatistics>();

    this.submissions = [];

    this.placeChartPoints = [];

    this.awards = [];

    this.se = 0;
  }

  get penaltyToMinute() {
    return Math.floor(this.penalty / 60);
  }

  get isUnofficial() {
    return this.group.includes("unofficial");
  }

  get isGirl() {
    return this.group.includes("girl");
  }

  get isEffectiveTeam() {
    return this.solvedProblemNum > 0;
  }

  get dirt() {
    const attemptedNum = this.attemptedProblemNum;
    const solvedNum = this.solvedProblemNum;

    return calcDirt(attemptedNum, solvedNum);
  }

  membersToString(lang?: Lang): string {
    return this.members.map(member => member.name.getOrDefault(lang)).join(", ");
  }

  coachesToString(lang?: Lang): string {
    return this.coaches.map(member => member.name.getOrDefault(lang)).join(", ");
  }

  calcSE(totalTeams: number) {
    let acceptedProblemNums = 0;
    let total = 0;

    this.problemStatistics.forEach((p) => {
      if (p.isSolved) {
        acceptedProblemNums += 1;
        total += p.problem.statistics.acceptedNum;
      }
    });

    if (totalTeams === 0 || acceptedProblemNums === 0) {
      return 0;
    }

    const res = (acceptedProblemNums * totalTeams - total) / totalTeams / acceptedProblemNums;
    this.se = Math.round(res * 100) / 100;

    return this.se;
  }

  calcSolvedData(options: ContestOptions) {
    this.solvedProblemNum = 0;
    this.attemptedProblemNum = 0;

    this.penalty = 0;

    for (const p of this.problemStatistics) {
      if (p.isAccepted) {
        this.solvedProblemNum++;
        this.attemptedProblemNum += p.failedCount + 1;

        if (options?.calculationOfPenalty === "in_seconds"
          || options?.calculationOfPenalty === "accumulate_in_seconds_and_finally_to_the_minute") {
          this.penalty += p.penaltyInSecond;
        } else {
          this.penalty += p.penalty;
        }
      }
    }

    if (options?.calculationOfPenalty === "accumulate_in_seconds_and_finally_to_the_minute") {
      this.penalty = Math.floor(this.penalty / 60) * 60;
    }
  }

  calcAwards(awards?: Award[]) {
    if (!awards) {
      return;
    }

    for (const award of awards) {
      if (this.rank >= award.minRank && this.rank <= award.maxRank) {
        this.awards.push(award.medalType);
      }
    }
  }

  isEqualRank(otherTeam: Team) {
    return this.solvedProblemNum === otherTeam.solvedProblemNum
      && this.penalty === otherTeam.penalty
      && this.lastSolvedProblemStatistics?.solvedTimestampToMinute === otherTeam.lastSolvedProblemStatistics?.solvedTimestampToMinute;
  }

  postProcessPlaceChartPoints() {
    if (this.placeChartPoints.length === 0) {
      return;
    }

    const res = [];
    res.push(this.placeChartPoints[0]);

    for (let i = 1; i < this.placeChartPoints.length - 1; i++) {
      const p = this.placeChartPoints[i];
      const preP = res[res.length - 1];

      if (p.rank !== preP.rank || p.lastSolvedProblem !== preP.lastSolvedProblem) {
        res.push(p);
      }
    }

    if (this.placeChartPoints.length > 1) {
      res.push(this.placeChartPoints[this.placeChartPoints.length - 1]);
    }

    this.placeChartPoints = res;
  }

  static compare(lhs: Team, rhs: Team): number {
    if (lhs.solvedProblemNum !== rhs.solvedProblemNum) {
      return rhs.solvedProblemNum - lhs.solvedProblemNum;
    }

    if (lhs.penalty !== rhs.penalty) {
      return lhs.penalty - rhs.penalty;
    }

    if (lhs.lastSolvedProblemStatistics && rhs.lastSolvedProblemStatistics) {
      return lhs.lastSolvedProblemStatistics.solvedTimestampToMinute - rhs.lastSolvedProblemStatistics.solvedTimestampToMinute;
    }

    if (lhs.name < rhs.name) {
      return -1;
    } else if (lhs.name > rhs.name) {
      return 1;
    }

    return 0;
  }
}

export type Teams = Array<Team>;

export function createTeam(teamJSON: ITeam): Team {
  const t = new Team();

  t.id = teamJSON.id ?? teamJSON.team_id ?? "";
  t.name = I18nText.fromIText(teamJSON.name ?? teamJSON.team_name ?? "");

  if (teamJSON.organization) {
    t.organizationId = teamJSON.organization;
    t.organizationName = teamJSON.organization;
  } else {
    t.organizationId = teamJSON.organization_id;
  }

  t.group = _.cloneDeep(teamJSON.group ?? []);
  t.tag = _.cloneDeep(teamJSON.tag ?? []);

  t.members = createPersons(teamJSON.members);

  if (teamJSON.coach) {
    t.coaches = createPersons(teamJSON.coach);
  } else {
    t.coaches = createPersons(teamJSON.coaches);
  }

  if (Boolean(teamJSON.official) === true) {
    t.group.push("official");
  }

  if (Boolean(teamJSON.unofficial) === true) {
    t.group.push("unofficial");
  }

  if (Boolean(teamJSON.girl) === true) {
    t.group.push("girl");
  }

  {
    const tt: any = teamJSON as any;
    for (const key of Object.keys(tt)) {
      if (key === "missing_photo") {
        continue;
      }
      if (tt[key] === 1 || tt[key] === true) {
        t.group.push(key);
      }
    }
  }

  t.group = [...new Set(t.group)];
  t.group.sort();

  t.badge = teamJSON.badge;

  if (teamJSON.missing_photo) {
    t.missingPhoto = true;
  }
  t.photo = teamJSON.photo;

  if (teamJSON.location) {
    t.location = teamJSON.location;
  }

  if (teamJSON.icpc_id) {
    t.icpcID = teamJSON.icpc_id;
  }

  if (teamJSON.ip) {
    t.ip = teamJSON.ip;
  }

  return t;
}

export function createTeams(teamsJSON: ITeams): Teams {
  if (Array.isArray(teamsJSON)) {
    return teamsJSON.map(t => createTeam(t));
  } else {
    const teams = Object.entries(teamsJSON).map(([teamId, team]) =>
      createTeam({ ...team, team_id: team.team_id ?? teamId }),
    );
    return teams;
  }
}
