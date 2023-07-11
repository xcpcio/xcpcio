import { Problem as IProblem, Problems as IProblems, BalloonColor } from "@xcpcio/types";

import { Submissions } from "./submission";

export interface ProblemStatistics {
  acceptedNum: number;
  rejectedNum: number;
  pendingNum: number;

  submittedNum: number;
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

    this.statistics = {
      acceptedNum: 0,
      rejectedNum: 0,
      pendingNum: 0,
      submittedNum: 0,
    };
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

  constructor() {
    this.isFirstSolved = false;

    this.isSolved = false;
    this.solvedTimestamp = 0;

    this.isSubmitted = false;
    this.lastSubmitTimestamp = 0;

    this.failedCount = 0;
    this.pendingCount = 0;
    this.ignoreCount = 0;
    this.totalCount = 0;

    this.submissions = [];
    this.problem = new Problem();
  }

  isAccepted() {
    return this.isSolved;
  }

  isWrongAnswer() {
    return !this.isSolved && this.pendingCount === 0 && this.failedCount > 0;
  }

  isPending() {
    return !this.isSolved && this.pendingCount > 0;
  }

  isUnSubmitted() {
    return this.totalCount === 0;
  }
}
