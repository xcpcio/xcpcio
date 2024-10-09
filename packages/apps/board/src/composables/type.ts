import type { Problem, Submission, Team } from "@xcpcio/core";

export interface AnimatedSubmissionBlockItem {
  submission: Submission;
  team: Team;
  problem: Problem;
  displayName: string;
}

export enum LastBlockDisplayType {
  SUBMISSION_STATUS,
  SUBMIT_TIMESTAMP,
}
