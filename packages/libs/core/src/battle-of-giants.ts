import { Base64 } from "js-base64";
import { type SelectOptionItem } from "./basic-types";
import type { Team } from "./team";

export enum GiantsType {
  BLUE,
  RED,
}

export class Giants {
  type: GiantsType;
  name: string;

  filterOrganizations: Array<SelectOptionItem>;
  filterOrganizationMap: Map<string, SelectOptionItem>;
  filterTeams: Array<SelectOptionItem>;
  filterTeamMap: Map<string, SelectOptionItem>;

  teams: Array<Team>;

  constructor(type: GiantsType = GiantsType.BLUE) {
    this.type = type;
    this.name = `${type === GiantsType.BLUE ? "Blue" : "Red"} Team`;
    this.teams = [];

    this.filterOrganizations = [];
    this.filterOrganizationMap = new Map<string, SelectOptionItem>();
    this.filterTeams = [];
    this.filterTeamMap = new Map<string, SelectOptionItem>();
  }

  setFilterOrganizations(filterOrganizations: Array<SelectOptionItem>) {
    const m = new Map<string, SelectOptionItem>();
    filterOrganizations.forEach((item) => {
      m.set(item.value, item);
    });

    this.filterOrganizations = filterOrganizations;
    this.filterOrganizationMap = m;
  }

  setFilterTeams(filterTeams: Array<SelectOptionItem>) {
    const m = new Map<string, SelectOptionItem>();
    filterTeams.forEach((item) => {
      m.set(item.value, item);
    });

    this.filterTeams = filterTeams;
    this.filterTeamMap = m;
  }

  refreshName() {
    if (this.filterOrganizations.length > 0) {
      this.name = this.filterOrganizations[0].text;
    } else {
      this.name = `${this.type === GiantsType.BLUE ? "Blue" : "Red"} Team`;
    }

    return this.name;
  }

  get totalSolvedProblemNum(): number {
    let total = 0;
    this.teams.forEach((team) => {
      total += team.solvedProblemNum;
    });
    return total;
  }

  get totalPenalty(): number {
    let total = 0;
    this.teams.forEach((team) => {
      total += team.penaltyToMinute;
    });
    return total;
  }

  get totalPenaltyToString(): string {
    const penalty = this.totalPenalty;
    const two = (a: number) => {
      if (a < 10) {
        return `0${a}`;
      }

      return String(a);
    };

    const h = Math.floor(penalty / 60);
    const m = Math.floor(penalty % 60);

    return [two(h), two(m)].join(":");
  }

  toJSON() {
    return {
      type: this.type,
      name: this.name,
      filterOrganizations: this.filterOrganizations,
      filterTeams: this.filterTeams,
    };
  }
}

export class BattleOfGiants {
  enable: boolean;
  topX: number;
  equalTeams: boolean;
  persist: boolean;

  blueTeam: Giants;
  redTeam: Giants;

  constructor() {
    this.enable = false;
    this.topX = 5;
    this.equalTeams = true;
    this.persist = false;

    this.blueTeam = new Giants(GiantsType.BLUE);
    this.redTeam = new Giants(GiantsType.RED);
  }

  ToBase64(): string {
    return Base64.encode(JSON.stringify(this));
  }

  FromBase64(base64: string) {
    if (base64.length === 0) {
      return;
    }

    if (Base64.isValid(base64) === false) {
      return;
    }

    const j = JSON.parse(Base64.decode(base64));

    this.enable = j.enable;
    this.topX = j.topX;
    this.equalTeams = j.equalTeams;
    this.persist = j.persist;

    this.blueTeam = new Giants(GiantsType.BLUE);
    this.blueTeam.name = j.blueTeam.name;
    this.blueTeam.setFilterOrganizations(j.blueTeam.filterOrganizations);
    this.blueTeam.setFilterTeams(j.blueTeam.filterTeams);

    this.redTeam = new Giants(GiantsType.RED);
    this.redTeam.name = j.redTeam.name;
    this.redTeam.setFilterOrganizations(j.redTeam.filterOrganizations);
    this.redTeam.setFilterTeams(j.redTeam.filterTeams);
  }
}
