import type { CalculationOfPenalty, ContestOptions as IContestOptions, Image, TimeUnit } from "@xcpcio/types";

export class ContestOptions {
  enableOrganization: boolean;
  calculationOfPenalty: CalculationOfPenalty;
  submissionTimestampUnit: TimeUnit;

  submissionHasTimeField: boolean;
  submissionHasLanguageField: boolean;

  submissionEnableActionField: boolean;
  submissionHasReactionField: boolean;
  submissionHasExternalUrlField: boolean;
  submissionHasRealtimeReactionStreamField: boolean;

  reactionVideoUrlTemplate?: string;
  submissionExternalUrlTemplate?: string;

  teamPhotoTemplate?: Image;
  teamWebcamStreamUrlTemplate?: string;
  teamScreenStreamUrlTemplate?: string;

  realtimeReactionWebcamStreamUrlTemplate?: string;
  realtimeReactionScreenStreamUrlTemplate?: string;

  constructor() {
    this.enableOrganization = false;
    this.calculationOfPenalty = "in_minutes";
    this.submissionTimestampUnit = "second";

    this.submissionHasTimeField = false;
    this.submissionHasLanguageField = false;

    this.submissionEnableActionField = false;
    this.submissionHasReactionField = false;
    this.submissionHasExternalUrlField = false;
    this.submissionHasRealtimeReactionStreamField = false;
  }
}

export function createContestOptions(contestOptionsJSON: IContestOptions = {}): ContestOptions {
  const j = contestOptionsJSON;
  const o = new ContestOptions();

  o.enableOrganization = !!j.enable_organization;

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

  if (j.realtime_reaction_webcam_stream_url_template || j.realtime_reaction_screen_stream_url_template) {
    o.submissionHasRealtimeReactionStreamField = true;
    o.realtimeReactionWebcamStreamUrlTemplate = j.realtime_reaction_webcam_stream_url_template;
    o.realtimeReactionScreenStreamUrlTemplate = j.realtime_reaction_screen_stream_url_template;
  }

  o.submissionEnableActionField = o.submissionHasReactionField || o.submissionHasExternalUrlField || o.submissionHasRealtimeReactionStreamField;
  o.reactionVideoUrlTemplate = j.reaction_video_url_template;
  o.teamPhotoTemplate = j.team_photo_url_template;

  o.teamWebcamStreamUrlTemplate = j.team_webcam_stream_url_template;
  o.teamScreenStreamUrlTemplate = j.team_screen_stream_url_template;

  return o;
}
