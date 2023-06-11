import { Problem as IProblem, Problems as IProblems, ProblemStatistics, BalloonColor } from "@xcpcio/types";

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
      accepted: 0,
      submitted: 0,
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
