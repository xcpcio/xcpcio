import type { CalculationOfPenalty, ContestOptions as IContestOptions, TimeUnit } from "@xcpcio/types";

export class ContestOptions {
  calculationOfPenalty: CalculationOfPenalty;
  submissionTimestampUnit: TimeUnit;

  submissionHasTimeField: boolean;
  submissionHasLanguageField: boolean;
  submissionEnableActionField: boolean;

  constructor() {
    this.calculationOfPenalty = "in_minutes";
    this.submissionTimestampUnit = "second";

    this.submissionHasTimeField = false;
    this.submissionHasLanguageField = false;
    this.submissionEnableActionField = false;
  }
}

export function createContestOptions(contestOptionsJSON: IContestOptions = {}): ContestOptions {
  const j = contestOptionsJSON;
  const o = new ContestOptions();

  if (j.calculation_of_penalty) {
    o.calculationOfPenalty = j.calculation_of_penalty;
  }

  if (j.submission_timestamp_unit) {
    o.submissionTimestampUnit = j.submission_timestamp_unit;
  }

  if (j.submission_has_reaction) {
    o.submissionEnableActionField = j.submission_has_reaction;
  }

  return o;
}
