export enum SubmissionStatus {
  Accepted = 'Accepted',
  Correct = 'Correct',
  correct = 'Correct',

  Pending = 'Pending',

  ConfigurationError = 'Configuration Error',
  SystemError = 'System Error',
  Canceled = 'Canceled',

  CompilationError = 'Compilation Error',

  FileError = 'File Error',
  RuntimeError = 'Runtime Error',
  TimeLimitExceeded = 'Time Limit Exceeded',
  MemoryLimitExceeded = 'Memory Limit Exceeded',
  OutputLimitExceeded = 'Output Limit Exceeded',

  PartiallyCorrect = 'Partially Correct',
  WrongAnswer = 'Wrong Answer',
  Reject = 'Reject',
  InCorrect = 'InCorrect',
  incorrect = 'Incorrect',

  JudgementFailed = 'Judgement Failed',

  Frozen = 'Frozen',
  Hacked = ' Hacked',

  Skipped = 'Skipped',
  PresentationError = 'Presentation Error',

  SecurityViolated = 'Security Violated',
  DenialOfJudgement = 'Denial Of Judgement',
  IdlenessLimitExceeded = 'Idleness LimitExceeded',
}

export type RunStatus =
  | 'Accepted'
  | 'Correct'
  | 'correct'
  | 'Pending'
  | 'pending'
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
  | 'InCorrect'
  | 'incorrect'
  | 'JudgementFailed'
  | 'Frozen'
  | 'Hacked'
  | 'Skipped'
  | 'PresentationError'
  | 'SecurityViolated'
  | 'DenialOfJudgement'
  | 'IdlenessLimitExceeded';

export interface Run {
  team_id: number | string;
  timestamp: number;
  problem_id: number;
  status: RunStatus;
}
