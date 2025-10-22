import type { CalculationOfPenalty, ContestOptions as IContestOptions, Image, TimeUnit } from "@xcpcio/types";

export class ContestOptions {
  calculationOfPenalty: CalculationOfPenalty;
  submissionTimestampUnit: TimeUnit;

  submissionHasTimeField: boolean;
  submissionHasLanguageField: boolean;

  submissionEnableActionField: boolean;
  submissionHasReactionField: boolean;

  reactionVideoUrlTemplate?: string;

  teamPhotoTemplate?: Image;

  constructor() {
    this.calculationOfPenalty = "in_minutes";
    this.submissionTimestampUnit = "second";

    this.submissionHasTimeField = false;
    this.submissionHasLanguageField = false;

    this.submissionEnableActionField = false;
    this.submissionHasReactionField = false;
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

  if (j.submission_has_reaction || j.has_reaction_videos) {
    o.submissionHasReactionField = true;
  }

  o.submissionEnableActionField = o.submissionHasReactionField;
  o.reactionVideoUrlTemplate = j.reaction_video_url_template;
  o.teamPhotoTemplate = j.team_photo_url_template;

  return o;
}
