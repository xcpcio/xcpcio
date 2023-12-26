import { type SelectOptionItem } from "./basic-types";

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

  constructor(type: GiantsType = GiantsType.BLUE) {
    this.type = type;
    this.name = `${type === GiantsType.BLUE ? "Blue" : "Red"} Team`;

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
}

export class BattleOfGiants {
  enable: boolean;
  topX: number;
  persist: boolean;

  blueTeam: Giants;
  redTeam: Giants;

  constructor() {
    this.enable = false;
    this.topX = 5;
    this.persist = false;

    this.blueTeam = new Giants(GiantsType.BLUE);
    this.redTeam = new Giants(GiantsType.RED);
  }
}
