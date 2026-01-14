import type { CalculationOfPenalty, ContestOptions as IContestOptions, Image, TimeUnit } from "@xcpcio/types";

export class ContestOptions {
  calculationOfPenalty: CalculationOfPenalty;
  submissionTimestampUnit: TimeUnit;

  submissionHasTimeField: boolean;
  submissionHasLanguageField: boolean;

  submissionEnableActionField: boolean;
  submissionHasReactionField: boolean;
  submissionHasExternalUrlField: boolean;

  reactionVideoUrlTemplate?: string;
  submissionExternalUrlTemplate?: string;

  teamPhotoTemplate?: Image;
  teamWebcamStreamUrlTemplate?: string;
  teamScreenStreamUrlTemplate?: string;

  constructor() {
    this.calculationOfPenalty = "in_minutes";
    this.submissionTimestampUnit = "second";

    this.submissionHasTimeField = false;
    this.submissionHasLanguageField = false;

    this.submissionEnableActionField = false;
    this.submissionHasReactionField = false;
    this.submissionHasExternalUrlField = false;
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

  if (j.has_reaction_videos) {
    o.submissionHasReactionField = true;
  }

  if (j.submission_external_url_template) {
    o.submissionHasExternalUrlField = true;
    o.submissionExternalUrlTemplate = j.submission_external_url_template;
  }

  o.submissionEnableActionField = o.submissionHasReactionField || o.submissionHasExternalUrlField;
  o.reactionVideoUrlTemplate = j.reaction_video_url_template;
  o.teamPhotoTemplate = j.team_photo_url_template;

  o.teamWebcamStreamUrlTemplate = j.team_webcam_stream_url_template;
  o.teamScreenStreamUrlTemplate = j.team_screen_stream_url_template;

  return o;
}
