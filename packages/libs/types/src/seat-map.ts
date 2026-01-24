import type { Text } from "./basic-types";

export interface SeatMapSection {
  title?: Text;
  rowLabels?: Array<string | null>;
  grid: Array<Array<string | null>>;
}

export interface SeatMap {
  sections: Array<SeatMapSection>;
}
