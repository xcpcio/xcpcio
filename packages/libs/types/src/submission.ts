import type { SubmissionStatus } from "./submission-status";

export interface SubmissionReaction {
  url: string;
}

export interface Submission {
  id?: string;
  submission_id?: string;

  team_id: string;
  problem_id: number | string;
  timestamp: number; // unit: seconds
  status: SubmissionStatus | string;

  time?: number;
  language?: string;

  is_ignore?: boolean;

  reaction?: SubmissionReaction;
  missing_reaction?: boolean;
}

export type Submissions = Array<Submission> | Record<string /* submission_id */, Submission>;
