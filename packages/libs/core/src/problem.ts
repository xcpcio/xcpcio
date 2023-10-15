import type { BalloonColor, Problem as IProblem, Problems as IProblems } from "@xcpcio/types";

import type { Submissions } from "./submission";
import { calcDirt } from "./utils";

export class ProblemStatistics {
  acceptedNum: number;
  rejectedNum: number;
  pendingNum: number;

  submittedNum: number;
  attemptedNum: number;
  ignoreNum: number;

  firstSolveSubmissions: Submissions;
  lastSolveSubmissions: Submissions;

  constructor() {
    this.acceptedNum = 0;
    this.rejectedNum = 0;
    this.pendingNum = 0;

    this.submittedNum = 0;
    this.attemptedNum = 0;
    this.ignoreNum = 0;

    this.firstSolveSubmissions = [];
    this.lastSolveSubmissions = [];
  }

  reset() {
    this.acceptedNum = 0;
    this.rejectedNum = 0;
    this.pendingNum = 0;

    this.submittedNum = 0;
    this.attemptedNum = 0;
    this.ignoreNum = 0;

    this.firstSolveSubmissions = [];
    this.lastSolveSubmissions = [];
  }

  get dirt() {
    if (this.acceptedNum === 0) {
      return 0;
    }

    return calcDirt(this.attemptedNum, this.acceptedNum);
  }
}

export class Problem {
  id: string;
  label: string;

  name: string;

  timeLimit?: string;
  memoryLimit?: string;

  balloonColor?: BalloonColor;

  statistics: ProblemStatistics;

  constructor() {
    this.id = "";
    this.label = "";

    this.name = "";

    this.statistics = new ProblemStatistics();
  }
}

export type Problems = Array<Problem>;

export function createProblem(problemJSON: IProblem): Problem {
  const p = new Problem();

  p.id = String(problemJSON.id);
  p.label = problemJSON.label;

  p.name = problemJSON.name ?? "";

  p.timeLimit = problemJSON.time_limit;
  p.memoryLimit = problemJSON.memory_limit;

  p.balloonColor = problemJSON.balloon_color;

  return p;
}

export function createProblems(problemsJSON: IProblems): Problems {
  return problemsJSON.map((pJSON) => {
    const p = new Problem();

    p.id = pJSON.id;
    p.label = pJSON.label;

    p.name = pJSON.name ?? "";

    p.timeLimit = pJSON.time_limit;
    p.memoryLimit = pJSON.memory_limit;

    p.balloonColor = pJSON.balloon_color;

    return p;
  });
}

export function createProblemsByProblemIds(problemIds: string[], balloonColors?: BalloonColor[]): Problems {
  const problems = problemIds.map((label: string, index: number) => {
    const p = new Problem();
    p.id = String(index);
    p.label = label;

    return p;
  });

  if (balloonColors !== undefined && balloonColors !== null) {
    for (const index in balloonColors) {
      problems[index].balloonColor = balloonColors[index];
    }
  }

  return problems;
}

export class TeamProblemStatistics {
  isFirstSolved: boolean;

  isSolved: boolean;
  solvedTimestamp: number;

  isSubmitted: boolean;
  lastSubmitTimestamp: number;

  failedCount: number;
  pendingCount: number;
  ignoreCount: number;
  totalCount: number;

  submissions: Submissions;
  problem: Problem;

  contestPenalty: number;

  constructor(options?: { teamProblemStatistics?: TeamProblemStatistics }) {
    this.isFirstSolved = options?.teamProblemStatistics?.isFirstSolved ?? false;

    this.isSolved = options?.teamProblemStatistics?.isSolved ?? false;
    this.solvedTimestamp = options?.teamProblemStatistics?.solvedTimestamp ?? 0;

    this.isSubmitted = options?.teamProblemStatistics?.isSubmitted ?? false;
    this.lastSubmitTimestamp = options?.teamProblemStatistics?.lastSubmitTimestamp ?? 0;

    this.failedCount = options?.teamProblemStatistics?.failedCount ?? 0;
    this.pendingCount = options?.teamProblemStatistics?.pendingCount ?? 0;
    this.ignoreCount = options?.teamProblemStatistics?.ignoreCount ?? 0;
    this.totalCount = options?.teamProblemStatistics?.totalCount ?? 0;

    this.submissions = options?.teamProblemStatistics?.submissions ?? [];
    this.problem = options?.teamProblemStatistics?.problem ?? new Problem();

    this.contestPenalty = options?.teamProblemStatistics?.contestPenalty ?? 20 * 60;
  }

  get isAccepted() {
    return this.isSolved;
  }

  get isWrongAnswer() {
    return !this.isSolved && this.pendingCount === 0 && this.failedCount > 0;
  }

  get isPending() {
    return !this.isSolved && this.pendingCount > 0;
  }

  get isUnSubmitted() {
    return this.totalCount === 0;
  }

  get penalty() {
    if (this.isSolved === false) {
      return 0;
    }

    return Math.floor(this.solvedTimestamp / 60) * 60 + this.failedCount * this.contestPenalty;
  }

  get penaltyToMinute() {
    return Math.floor(this.penalty / 60);
  }

  get solvedTimestampToMinute() {
    return Math.floor(this.solvedTimestamp / 60);
  }
}
