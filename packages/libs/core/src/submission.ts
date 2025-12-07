import type { Submission as ISubmission, Submissions as ISubmissions, SubmissionReaction, TimeUnit } from "@xcpcio/types";
import type { Contest } from "./contest";

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
  timestampUnit: TimeUnit;

  time?: number;
  language?: string;

  reaction?: SubmissionReaction;

  status = SubmissionStatus.UNKNOWN;
  isIgnore = false;
  isSolved = false;
  isFirstSolved = false;

  constructor() {
    this.id = "";
    this.teamId = "";
    this.problemId = "";
    this.timestamp = 0;
    this.timestampUnit = "second";
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
    if (this.timestampUnit === "nanosecond") {
      return Math.floor(this.timestamp / 60 / 1000 / 1000 / 1000);
    }

    if (this.timestampUnit === "microsecond") {
      return Math.floor(this.timestamp / 60 / 1000 / 1000);
    }

    if (this.timestampUnit === "millisecond") {
      return Math.floor(this.timestamp / 60 / 1000);
    }

    return Math.floor(this.timestamp / 60);
  }

  get timestampToSecond() {
    if (this.timestampUnit === "nanosecond") {
      return Math.floor(this.timestamp / 1000 / 1000 / 1000);
    }

    if (this.timestampUnit === "microsecond") {
      return Math.floor(this.timestamp / 1000 / 1000);
    }

    if (this.timestampUnit === "millisecond") {
      return Math.floor(this.timestamp / 1000);
    }

    return this.timestamp;
  }

  get timestampDisplayFormatWithSecond(): string {
    const second = this.timestampToSecond;

    const h = Math.floor(second / 3600);
    const m = Math.floor(second % 3600 / 60);
    const s = second % 60;

    const f = (x: number) => x.toString().padStart(2, "0");

    const res = `${f(h)}:${f(m)}:${f(s)}`;

    return res;
  }

  get timestampDisplayFormatWithMilliSecond(): string {
    let res = this.timestampDisplayFormatWithSecond;

    if (this.timestampUnit === "millisecond") {
      const fl = (this.timestamp % 1000).toString().padStart(3, "0");
      res += `.${fl}`;
    }

    return res;
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

    if (lhs.id < rhs.id) {
      return -1;
    } else if (lhs.id === rhs.id) {
      return 0;
    } else {
      return 1;
    }
  }
}

export type Submissions = Array<Submission>;

export function createSubmission(submissionJSON: ISubmission, contest?: Contest): Submission {
  const s = new Submission();

  s.id = String(submissionJSON.id ?? submissionJSON.submission_id ?? "");
  s.teamId = String(submissionJSON.team_id);
  s.problemId = String(submissionJSON.problem_id);
  s.timestamp = submissionJSON.timestamp;
  s.status = stringToSubmissionStatus(submissionJSON.status);
  s.isIgnore = submissionJSON.is_ignore ?? false;

  if (submissionJSON.time) {
    s.time = submissionJSON.time;
  }

  if (submissionJSON.language) {
    s.language = submissionJSON.language;
  }

  if (submissionJSON.reaction) {
    s.reaction = submissionJSON.reaction;
  } else if (contest?.options.reactionVideoUrlTemplate && !submissionJSON.missing_reaction) {
    s.reaction = {
      url: contest.options.reactionVideoUrlTemplate.replace(/\$\{submission_id\}/, s.id),
    };
  }

  return s;
}

export function createSubmissions(submissionsJSON: ISubmissions, contest?: Contest): Submissions {
  if (Array.isArray(submissionsJSON)) {
    return submissionsJSON.map((s, index) => createSubmission({ ...s, id: s.id ?? s.submission_id ?? String(index) }, contest));
  } else {
    const submissions = Object.entries(submissionsJSON).map(([submissionId, s]) =>
      createSubmission({ ...s, id: s.id ?? s.submission_id ?? String(submissionId) }, contest),
    );
    return submissions;
  }
}
