export enum SubmissionStatus {
  Pending = 'Pending',
  Waiting = 'Waiting',
  Judging = 'Judging',
  Frozen = 'Frozen',

  Accepted = 'Accepted',

  CompilationError = 'Compilation Error',
  PresentationError = 'Presentation Error',

  FileError = 'File Error',
  RuntimeError = 'Runtime Error',

  TimeLimitExceeded = 'Time Limit Exceeded',
  MemoryLimitExceeded = 'Memory Limit Exceeded',
  OutputLimitExceeded = 'Output Limit Exceeded',
  IdlenessLimitExceeded = 'Idleness LimitExceeded',

  WrongAnswer = 'Wrong Answer',
  Reject = 'Reject',

  JudgementFailed = 'Judgement Failed',

  Hacked = 'Hacked',

  ConfigurationError = 'Configuration Error',
  SystemError = 'System Error',
  Canceled = 'Canceled',
  Skipped = 'Skipped',

  SecurityViolated = 'Security Violated',
  DenialOfJudgement = 'Denial Of Judgement',

  PartiallyCorrect = 'Partially Correct',

  Unknown = 'Unknown',
  Undefined = 'Undefined',
}

export type RunStatus =
  | 'Accepted'
  | 'Pending'
  | 'ConfigurationError'
  | 'SystemError'
  | 'Canceled'
  | 'CompilationError'
  | 'FileError'
  | 'RuntimeError'
  | 'TimeLimitExceeded'
  | 'MemoryLimitExceeded'
  | 'OutputLimitExceeded'
  | 'PartiallyCorrect'
  | 'WrongAnswer'
  | 'Reject'
  | 'JudgementFailed'
  | 'Frozen'
  | 'Hacked'
  | 'Skipped'
  | 'PresentationError'
  | 'SecurityViolated'
  | 'DenialOfJudgement'
  | 'IdlenessLimitExceeded';

export interface Run {
  teamId: string;
  timestamp: number;
  problemId: number;
  status: SubmissionStatus;
}

export interface Submission {
  teamId: string;
  timestamp: number;
  problemId: number;
  status: SubmissionStatus;
}
