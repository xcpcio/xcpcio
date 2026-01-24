import type { SeatMap as ISeatMap, SeatMapSection as ISeatMapSection } from "@xcpcio/types";

import type { Team, Teams } from "./team";

import { I18nText } from "./basic-types";

export class SeatMapSection {
  title: I18nText;
  rowLabels: Array<string | null>;
  grid: Array<Array<string | null>>;

  constructor() {
    this.title = new I18nText();
    this.rowLabels = [];
    this.grid = [];
  }
}

export class SeatMap {
  sections: Array<SeatMapSection>;

  constructor() {
    this.sections = [];
  }

  /**
   * Build a map from seat IDs (from team.location) to teams
   */
  buildSeatToTeamMap(teams: Teams): Map<string, Team> {
    const map = new Map<string, Team>();

    for (const team of teams) {
      if (team.location) {
        map.set(team.location, team);
      }
    }

    return map;
  }
}

export function createSeatMapSection(sectionJSON: ISeatMapSection): SeatMapSection {
  const s = new SeatMapSection();

  s.title = I18nText.fromIText(sectionJSON.title ?? "");
  s.rowLabels = sectionJSON.rowLabels ?? [];
  s.grid = sectionJSON.grid ?? [];

  return s;
}

export function createSeatMap(seatMapJSON: ISeatMap): SeatMap {
  const sm = new SeatMap();

  sm.sections = (seatMapJSON.sections ?? []).map(createSeatMapSection);

  return sm;
}
