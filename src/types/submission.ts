export enum SubmissionStatus {
  Pending,
  Waiting,
  Judging,
  Frozen,

  Accepted,
  Correct,

  CompilationError,
  PresentationError,

  FileError,
  RuntimeError,

  TimeLimitExceeded,
  MemoryLimitExceeded,
  OutputLimitExceeded,
  IdlenessLimitExceeded,

  WrongAnswer,
  Reject,

  JudgementFailed,

  Hacked,

  ConfigurationError,
  SystemError,
  Canceled,
  Skipped,

  SecurityViolated,
  DenialOfJudgement,

  PartiallyCorrect,

  Unknown,
  Undefined,
}

export const SubmissionStatusText = [
  'Pending',
  'Waiting',
  'Judging',
  'Frozen',

  'Accepted',
  'Correct',

  'Compilation Error',
  'Presentation Error',

  'File Error',
  'Runtime Error',

  'Time Limit Exceeded',
  'Memory Limit Exceeded',
  'Output Limit Exceeded',
  'Idleness LimitExceeded',

  'Wrong Answer',
  'Reject',

  'Judgement Failed',

  'Hacked',

  'Configuration Error',
  'System Error',
  'Canceled',
  'Skipped',

  'Security Violated',
  'Denial Of Judgement',

  'Partially Correct',

  'Unknown',
  'Undefined',
];

export interface Run {
  teamId: string;
  timestamp: number;
  problemId: number;
  status: SubmissionStatus;
}

export interface Submission {
  id?: string;
  team_id?: string;
  problem_id?: string;
  timestamp?: number;
  status?: string;
}
