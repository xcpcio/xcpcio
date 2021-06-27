import { SubmissionStatus } from "@/interface/submission";

export function isAccepted(status: SubmissionStatus): boolean {
  if (status === SubmissionStatus.Accepted) {
    return true;
  }
  return false;
}

export function isWrongAnswer(status: SubmissionStatus): boolean {
  if (
    status === SubmissionStatus.WrongAnswer ||
    status === SubmissionStatus.RuntimeError ||
    status === SubmissionStatus.TimeLimitExceeded ||
    status === SubmissionStatus.MemoryLimitExceeded ||
    status === SubmissionStatus.OutputLimitExceeded ||
    status === SubmissionStatus.IdlenessLimitExceeded ||
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
    status === SubmissionStatus.Skipped
  ) {
    return true;
  }
  return false;
}
