export enum SubmissionStatus {
  Pending = "Pending",
  Frozen = "Frozen",

  Accepted = "Accepted",

  CompilationError = "Compilation Error",
  PresentationError = "Presentation Error",

  FileError = "File Error",
  RuntimeError = "Runtime Error",

  TimeLimitExceeded = "Time Limit Exceeded",
  MemoryLimitExceeded = "Memory Limit Exceeded",
  OutputLimitExceeded = "Output Limit Exceeded",
  IdlenessLimitExceeded = "Idleness LimitExceeded",

  WrongAnswer = "Wrong Answer",
  Reject = "Reject",

  JudgementFailed = "Judgement Failed",

  Hacked = "Hacked",

  ConfigurationError = "Configuration Error",
  SystemError = "System Error",
  Canceled = "Canceled",
  Skipped = "Skipped",

  SecurityViolated = "Security Violated",
  DenialOfJudgement = "Denial Of Judgement",

  PartiallyCorrect = "Partially Correct",
}

export type RunStatus =
  | "Accepted"
  | "Pending"
  | "ConfigurationError"
  | "SystemError"
  | "Canceled"
  | "CompilationError"
  | "FileError"
  | "RuntimeError"
  | "TimeLimitExceeded"
  | "MemoryLimitExceeded"
  | "OutputLimitExceeded"
  | "PartiallyCorrect"
  | "WrongAnswer"
  | "Reject"
  | "JudgementFailed"
  | "Frozen"
  | "Hacked"
  | "Skipped"
  | "PresentationError"
  | "SecurityViolated"
  | "DenialOfJudgement"
  | "IdlenessLimitExceeded";

export interface Run {
  team_id: number | string;
  timestamp: number;
  problem_id: number;
  status: SubmissionStatus;
}
