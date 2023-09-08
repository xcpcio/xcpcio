import type { Submission as ISubmission, Submissions as ISubmissions } from "@xcpcio/types";
import { SubmissionStatus } from "@xcpcio/types";

import {
  isAccepted,
  isNotCalculatedPenaltyStatus,
  isPending,
  isRejected,
  stringToSubmissionStatus,
} from "./submission-status";

export class Submission {
  id: string;
  teamId: string;
  problemId: string;
  timestamp: number;

  status = SubmissionStatus.UNKNOWN;
  isIgnore = false;

  constructor() {
    this.id = "";
    this.teamId = "";
    this.problemId = "";
    this.timestamp = 0;
  }

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

  get timestampToMinute() {
    return Math.floor(this.timestamp / 60);
  }

  static compare(lhs: Submission, rhs: Submission): number {
    if (lhs.timestamp !== rhs.timestamp) {
      return lhs.timestamp - rhs.timestamp;
    }

    if (lhs.teamId === rhs.teamId) {
      if (lhs.isAccepted() && !rhs.isAccepted()) {
        return -1;
      }

      if (!lhs.isAccepted() && rhs.isAccepted()) {
        return 1;
      }
    }

    return 0;
  }
}

export type Submissions = Array<Submission>;

export function createSubmission(submissionJSON: ISubmission): Submission {
  const s = new Submission();

  s.id = String(submissionJSON.id ?? submissionJSON.submission_id ?? "");
  s.teamId = String(submissionJSON.team_id);
  s.problemId = String(submissionJSON.problem_id);
  s.timestamp = submissionJSON.timestamp;
  s.status = stringToSubmissionStatus(submissionJSON.status);
  s.isIgnore = submissionJSON.is_ignore ?? false;

  return s;
}

export function createSubmissions(submissionsJSON: ISubmissions): Submissions {
  if (Array.isArray(submissionsJSON)) {
    return submissionsJSON.map((s, index) => createSubmission({ ...s, id: s.submission_id ?? String(index) }));
  } else {
    const submissions = Object.entries(submissionsJSON).map(([submissionId, s]) =>
      createSubmission({ ...s, id: s.submission_id ?? submissionId }),
    );

    return submissions;
  }
}
