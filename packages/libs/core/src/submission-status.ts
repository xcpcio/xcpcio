import { SubmissionStatus } from "@xcpcio/types";

export function stringToSubmissionStatus(status: string): SubmissionStatus {
  status = status.toUpperCase().replace(" ", "_");

  if (["OK", "AC", SubmissionStatus.ACCEPTED.toString()].includes(status)) {
    return SubmissionStatus.ACCEPTED;
  }

  if ([SubmissionStatus.CORRECT.toString()].includes(status)) {
    return SubmissionStatus.ACCEPTED;
  }

  if ([SubmissionStatus.PARTIALLY_CORRECT.toString()].includes(status)) {
    return SubmissionStatus.PARTIALLY_CORRECT;
  }

  if (["WA", SubmissionStatus.WRONG_ANSWER.toString()].includes(status)) {
    return SubmissionStatus.WRONG_ANSWER;
  }

  if (["RJ", "INCORRECT", SubmissionStatus.REJECTED.toString()].includes(status)) {
    return SubmissionStatus.REJECTED;
  }

  if (["PD", SubmissionStatus.PENDING.toString()].includes(status)) {
    return SubmissionStatus.PENDING;
  }

  if ([SubmissionStatus.WAITING.toString()].includes(status)) {
    return SubmissionStatus.WAITING;
  }

  if ([SubmissionStatus.JUDGING.toString()].includes(status)) {
    return SubmissionStatus.JUDGING;
  }

  if ([SubmissionStatus.FROZEN.toString()].includes(status)) {
    return SubmissionStatus.FROZEN;
  }

  if (["CE", SubmissionStatus.COMPILATION_ERROR.toString()].includes(status)) {
    return SubmissionStatus.COMPILATION_ERROR;
  }

  if (["PE", SubmissionStatus.PRESENTATION_ERROR.toString()].includes(status)) {
    return SubmissionStatus.PRESENTATION_ERROR;
  }

  if (["TL", "TLE", SubmissionStatus.TIME_LIMIT_EXCEEDED.toString()].includes(status)) {
    return SubmissionStatus.TIME_LIMIT_EXCEEDED;
  }

  if (["ML", "MLE", SubmissionStatus.MEMORY_LIMIT_EXCEEDED.toString()].includes(status)) {
    return SubmissionStatus.MEMORY_LIMIT_EXCEEDED;
  }

  if (["OL", "OLE", SubmissionStatus.OUTPUT_LIMIT_EXCEEDED.toString()].includes(status)) {
    return SubmissionStatus.OUTPUT_LIMIT_EXCEEDED;
  }

  if (["IL", "ILE", SubmissionStatus.IDLENESS_LIMIT_EXCEEDED.toString()].includes(status)) {
    return SubmissionStatus.IDLENESS_LIMIT_EXCEEDED;
  }

  if (["RT", "RE", "RTE", SubmissionStatus.RUNTIME_ERROR.toString()].includes(status)) {
    return SubmissionStatus.RUNTIME_ERROR;
  }

  if (["JE", SubmissionStatus.JUDGEMENT_FAILED.toString()].includes(status)) {
    return SubmissionStatus.JUDGEMENT_FAILED;
  }

  if (["SE", SubmissionStatus.SYSTEM_ERROR.toString()].includes(status)) {
    return SubmissionStatus.SYSTEM_ERROR;
  }

  if ([SubmissionStatus.HACKED.toString()].includes(status)) {
    return SubmissionStatus.HACKED;
  }

  if ([SubmissionStatus.CONFIGURATION_ERROR.toString()].includes(status)) {
    return SubmissionStatus.CONFIGURATION_ERROR;
  }

  if ([SubmissionStatus.CANCELED.toString()].includes(status)) {
    return SubmissionStatus.CANCELED;
  }

  if ([SubmissionStatus.SKIPPED.toString()].includes(status)) {
    return SubmissionStatus.SKIPPED;
  }

  if ([SubmissionStatus.SECURITY_VIOLATED.toString()].includes(status)) {
    return SubmissionStatus.SECURITY_VIOLATED;
  }

  if ([SubmissionStatus.DENIAL_OF_JUDGEMENT.toString()].includes(status)) {
    return SubmissionStatus.DENIAL_OF_JUDGEMENT;
  }

  return SubmissionStatus.UNKNOWN;
}

export function isAccepted(status: SubmissionStatus): boolean {
  const acceptedArray = [SubmissionStatus.ACCEPTED, SubmissionStatus.CORRECT];

  return acceptedArray.includes(status);
}

export function isRejected(status: SubmissionStatus): boolean {
  const rejectArray = [
    SubmissionStatus.RUNTIME_ERROR,
    SubmissionStatus.TIME_LIMIT_EXCEEDED,
    SubmissionStatus.MEMORY_LIMIT_EXCEEDED,
    SubmissionStatus.OUTPUT_LIMIT_EXCEEDED,
    SubmissionStatus.IDLENESS_LIMIT_EXCEEDED,
    SubmissionStatus.WRONG_ANSWER,
    SubmissionStatus.REJECTED,
    SubmissionStatus.JUDGEMENT_FAILED,
    SubmissionStatus.HACKED,
  ];

  return rejectArray.includes(status);
}

export function isPending(status: SubmissionStatus): boolean {
  const pendingArray = [
    SubmissionStatus.PENDING,
    SubmissionStatus.WAITING,
    SubmissionStatus.COMPILING,
    SubmissionStatus.JUDGING,
    SubmissionStatus.FROZEN,
  ];

  return pendingArray.includes(status);
}

export function isNotCalculatedPenaltyStatus(status: SubmissionStatus): boolean {
  const isNotCalculatedPenaltyArray = [
    SubmissionStatus.COMPILATION_ERROR,
    SubmissionStatus.PRESENTATION_ERROR,
    SubmissionStatus.CONFIGURATION_ERROR,
    SubmissionStatus.SYSTEM_ERROR,
    SubmissionStatus.CANCELED,
    SubmissionStatus.SKIPPED,
    SubmissionStatus.UNKNOWN,
    SubmissionStatus.UNDEFINED,
  ];

  return isNotCalculatedPenaltyArray.includes(status);
}
