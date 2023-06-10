import { Submission as ISubmission, Submissions as ISubmissions, SubmissionStatus } from "@xcpcio/types";

import {
  isAccepted,
  isRejected,
  isPending,
  isNotCalculatedPenaltyStatus,
  stringToSubmissionStatus,
} from "@/submission-status";

export class Submission {
  submissionId = "";
  teamId = "";
  problemId = "";
  timestamp = 0;
  status = SubmissionStatus.UNKNOWN;
  isIgnore = false;

  isAccepted() {
    return isAccepted(this.status);
  }

  isRejected() {
    return isRejected(this.status);
  }

  isPending() {
    return isPending(this.status);
  }

  isNotCalculatedPenaltyStatus() {
    return isNotCalculatedPenaltyStatus(this.status);
  }
}

export type Submissions = Array<Submission>;

export function createSubmission(submission_json: ISubmission): Submission {
  const s = new Submission();

  s.submissionId = submission_json.submission_id;
  s.teamId = submission_json.team_id;
  s.problemId = String(submission_json.problem_id);
  s.timestamp = submission_json.timestamp;
  s.status = stringToSubmissionStatus(submission_json.status);
  s.isIgnore = submission_json.is_ignore ?? false;

  return s;
}

export function createSubmissions(submissions_json: ISubmissions) {
  return submissions_json.map((s) => createSubmission(s));
}
