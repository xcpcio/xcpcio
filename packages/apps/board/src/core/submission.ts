import { Submission, SubmissionStatus } from "@/types/submission";

export function isAccepted(status: SubmissionStatus): boolean {
  if (
    status === SubmissionStatus.Accepted ||
    status === SubmissionStatus.Correct
  ) {
    return true;
  }

  return false;
}

export function isRejected(status: SubmissionStatus): boolean {
  if (
    status === SubmissionStatus.RuntimeError ||
    status === SubmissionStatus.TimeLimitExceeded ||
    status === SubmissionStatus.MemoryLimitExceeded ||
    status === SubmissionStatus.OutputLimitExceeded ||
    status === SubmissionStatus.IdlenessLimitExceeded ||
    status === SubmissionStatus.WrongAnswer ||
    status === SubmissionStatus.Reject ||
    status === SubmissionStatus.JudgementFailed ||
    status === SubmissionStatus.Hacked
  ) {
    return true;
  }

  return false;
}

export function isPending(status: SubmissionStatus): boolean {
  if (
    status === SubmissionStatus.Pending ||
    status === SubmissionStatus.Waiting ||
    status === SubmissionStatus.Judging ||
    status === SubmissionStatus.Frozen
  ) {
    return true;
  }

  return false;
}

export function isNotCalculatedPenaltyStatus(
  status: SubmissionStatus,
): boolean {
  if (
    status === SubmissionStatus.CompilationError ||
    status === SubmissionStatus.PresentationError ||
    status === SubmissionStatus.ConfigurationError ||
    status === SubmissionStatus.SystemError ||
    status === SubmissionStatus.Canceled ||
    status === SubmissionStatus.Skipped ||
    status === SubmissionStatus.Unknown
  ) {
    return true;
  }

  return false;
}

export function stringToSubmissionStatus(status: string): SubmissionStatus {
  status = status.toUpperCase().replace(" ", "");

  if (["OK", "AC", "ACCEPTED"].includes(status)) {
    return SubmissionStatus.Accepted;
  }

  if (["CORRECT"].includes(status)) {
    return SubmissionStatus.Correct;
  }

  if (["WA", "WRONGANSWER"].includes(status)) {
    return SubmissionStatus.WrongAnswer;
  }

  if (["RJ", "INCORRECT", "REJECT"].includes(status)) {
    return SubmissionStatus.Reject;
  }

  if (["PD", "PENDING"].includes(status)) {
    return SubmissionStatus.Pending;
  }

  if (["WAITING"].includes(status)) {
    return SubmissionStatus.Waiting;
  }

  if (["Judging"].includes(status)) {
    return SubmissionStatus.Judging;
  }

  if (["FROZEN"].includes(status)) {
    return SubmissionStatus.Frozen;
  }

  if (["CE", "COMPILATIONERROR"].includes(status)) {
    return SubmissionStatus.CompilationError;
  }

  if (["PE", "PRESENTATIONERROR"].includes(status)) {
    return SubmissionStatus.PresentationError;
  }

  if (["TL", "TLE", "TIMELIMITEXCEEDED"].includes(status)) {
    return SubmissionStatus.TimeLimitExceeded;
  }

  if (["ML", "MLE", "MEMORYLIMITEXCEEDED"].includes(status)) {
    return SubmissionStatus.MemoryLimitExceeded;
  }

  if (["OL", "OLE", "OUTPUTLIMITEXCEEDED"].includes(status)) {
    return SubmissionStatus.OutputLimitExceeded;
  }

  if (["IL", "ILE", "IDLENESSLIMITEXCEEDED"].includes(status)) {
    return SubmissionStatus.IdlenessLimitExceeded;
  }

  if (["RT", "RE", "RTE", "RUNTIMEERROR"].includes(status)) {
    return SubmissionStatus.RuntimeError;
  }

  if (["JF", "JE", "JUDGEERROR", "JUDGEMENTFAILED"].includes(status)) {
    return SubmissionStatus.JudgementFailed;
  }

  if (["HACKED"].includes(status)) {
    return SubmissionStatus.Hacked;
  }

  if (["CONFIGURATIONERROR"].includes(status)) {
    return SubmissionStatus.ConfigurationError;
  }

  if (["SE", "SYSTEMERROR"].includes(status)) {
    return SubmissionStatus.SystemError;
  }

  if (["CANCELED"].includes(status)) {
    return SubmissionStatus.Canceled;
  }

  if (["SKIPPED"].includes(status)) {
    return SubmissionStatus.Skipped;
  }

  if (["SECURITYVIOLATED"].includes(status)) {
    return SubmissionStatus.SecurityViolated;
  }

  if (["DENIALOFJUDGEMENT"].includes(status)) {
    return SubmissionStatus.DenialOfJudgement;
  }

  if (["PARTIALLYCORRECT"].includes(status)) {
    return SubmissionStatus.PartiallyCorrect;
  }

  if (["UNKNOWN"].includes(status)) {
    return SubmissionStatus.Unknown;
  }

  return SubmissionStatus.Undefined;
}

export interface SubmissionInstance {
  submissionID: string;
  teamID: string;
  problemID: string;
  timestamp: number;
  status: SubmissionStatus;
}

export function createSubmissionInstance(
  raw_submission_json: Submission,
  index: number,
): SubmissionInstance {
  const submissionID = raw_submission_json?.id ?? String(index);

  const teamID = raw_submission_json?.team_id ?? "";
  const problemID = raw_submission_json?.problem_id ?? "";
  const timestamp = raw_submission_json?.timestamp ?? 0;
  const status = stringToSubmissionStatus(raw_submission_json?.status ?? "");

  return {
    submissionID,
    teamID,
    problemID,
    timestamp,
    status,
  };
}

export function createSubmissionInstanceList(
  rawSubmissionListJSON: Submission[],
): SubmissionInstance[] {
  return rawSubmissionListJSON.map((submission, index) =>
    createSubmissionInstance(submission, index),
  );
}
