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

export function stringToSubmissionStatus(status: string): SubmissionStatus {
  status = status.toUpperCase().replace(" ", "");

  if (["OK", "AC", "CORRECT", "ACCEPTED"].includes(status)) {
    return SubmissionStatus.Accepted;
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

export function submissionStatusToCodeforcesDatFile(
  status: SubmissionStatus,
): string {
  if (isAccepted(status)) {
    return "OK";
  }

  if (status === SubmissionStatus.WrongAnswer) {
    return "WA";
  }

  if (status === SubmissionStatus.TimeLimitExceeded) {
    return "TL";
  }

  if (status === SubmissionStatus.MemoryLimitExceeded) {
    return "ML";
  }

  if (status === SubmissionStatus.OutputLimitExceeded) {
    return "IL";
  }

  if (status === SubmissionStatus.PresentationError) {
    return "PE";
  }

  if (status === SubmissionStatus.RuntimeError) {
    return "RT";
  }

  if (
    status === SubmissionStatus.CompilationError ||
    isNotCalculatedPenaltyStatus(status)
  ) {
    return "CE";
  }

  if (isPending(status)) {
    return "PD";
  }

  return "RJ";
}
