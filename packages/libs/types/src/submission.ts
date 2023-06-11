import { SubmissionStatus } from "./submission-status";

export interface Submission {
  id?: string;
  submission_id?: string;

  team_id: string;
  problem_id: number | string;
  timestamp: number; // unit: seconds
  status: SubmissionStatus | string;

  is_ignore?: boolean;
}

export type Submissions = Array<Submission> | Record<string, Submission>;
