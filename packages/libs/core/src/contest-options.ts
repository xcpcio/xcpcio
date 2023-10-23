import type { CalculationOfPenalty, ContestOptions as IContestOptions } from "@xcpcio/types";

export class ContestOptions {
  calculationOfPenalty: CalculationOfPenalty;

  constructor() {
    this.calculationOfPenalty = "in_minutes";
  }
}

export function createContestOptions(contestOptionsJSON: IContestOptions = {}): ContestOptions {
  const j = contestOptionsJSON;
  const o = new ContestOptions();

  if (j.calculation_of_penalty) {
    o.calculationOfPenalty = j.calculation_of_penalty;
  }

  return o;
}
