import { Contest as IContest, ContestState, Image, VERSION, StatusTimeDisplay } from "@xcpcio/types";

import { Problems, createProblems, createProblemsByProblemIds } from "./problem";
import { dayjs, createDayJS, getTimeDiff } from "./utils";

export class Contest {
  name = "";

  startTime: dayjs.Dayjs;
  endTime: dayjs.Dayjs;
  freezeTime?: dayjs.Dayjs;

  penalty: number;

  problems: Problems;
  statusTimeDisplay: StatusTimeDisplay;

  badge?: string;
  medal?: Record<string, Record<string, number>>;
  organization?: string;

  group?: Record<string, string>;
  tag?: Record<string, string>;

  logo?: Image;
  banner?: Image;
  boardLink?: string;

  version = VERSION;

  constructor() {
    this.startTime = createDayJS();
    this.endTime = createDayJS();

    // 20 mins
    this.penalty = 20 * 60;

    this.problems = [];
    this.statusTimeDisplay = {
      correct: true,
      incorrect: true,
      pending: true,
    };
  }

  getContestDuration(timeFormat = "HH:mm:ss"): string {
    return dayjs.duration(this.endTime.diff(this.startTime)).format(timeFormat);
  }

  getContestState(): ContestState {
    const now = createDayJS();

    if (now.isBefore(this.startTime)) {
      return ContestState.PENDING;
    }

    if (now.isSameOrAfter(this.endTime)) {
      return ContestState.FINISHED;
    }

    if (now.isSameOrAfter(this.freezeTime)) {
      return ContestState.FROZEN;
    }

    return ContestState.RUNNING;
  }

  getContestPendingTime(): string {
    let baseTime = createDayJS();
    if (baseTime.isAfter(this.startTime)) {
      baseTime = this.startTime;
    }

    return getTimeDiff(Math.floor(dayjs.duration(this.startTime.diff(baseTime)).asSeconds()));
  }

  getContestRemainingTime(endTime: dayjs.Dayjs): string {
    let baseTime = dayjs();
    if (baseTime.isAfter(endTime)) {
      baseTime = endTime;
    }

    return getTimeDiff(Math.floor(dayjs.duration(endTime.diff(baseTime)).asSeconds()));
  }

  getContestElapsedTime(): string {
    let baseTime = dayjs();
    if (baseTime.isAfter(this.endTime)) {
      baseTime = this.endTime;
    }

    return getTimeDiff(Math.floor(dayjs.duration(baseTime.diff(this.startTime)).asSeconds()));
  }

  getContestProgressRatio(): number {
    const baseTime = dayjs();

    if (this.startTime.isSameOrAfter(baseTime)) {
      return 0;
    }

    if (this.endTime.isSameOrBefore(baseTime)) {
      return 100;
    }

    const total = this.endTime.diff(this.startTime, "s");
    const pass = baseTime.diff(this.startTime, "s");

    return Math.round((pass * 100) / total);
  }
}

export function createContest(contestJSON: IContest): Contest {
  const c = new Contest();

  c.name = contestJSON.contest_name;

  c.startTime = createDayJS(contestJSON.start_time);
  c.endTime = createDayJS(contestJSON.end_time);

  {
    if (contestJSON.frozen_time !== undefined && contestJSON.frozen_time != null) {
      c.freezeTime = createDayJS(c.endTime.unix() - Number(contestJSON.frozen_time));
    }

    if (contestJSON.freeze_time !== undefined && contestJSON.freeze_time !== null) {
      c.freezeTime = createDayJS(contestJSON.freeze_time);
    }
  }

  c.penalty = contestJSON.penalty;

  {
    if (contestJSON.problem_id !== undefined && contestJSON.problem_id !== null) {
      c.problems = createProblemsByProblemIds(contestJSON.problem_id, contestJSON.balloon_color);
    }

    if (contestJSON.problems !== undefined && contestJSON.problems !== null) {
      c.problems = createProblems(contestJSON.problems);
    }
  }

  if (contestJSON.status_time_display !== undefined && contestJSON.status_time_display !== null) {
    c.statusTimeDisplay = {
      correct: Boolean(contestJSON.status_time_display.correct ?? false),
      incorrect: Boolean(contestJSON.status_time_display.incorrect ?? false),
      pending: Boolean(contestJSON.status_time_display.pending ?? false),
    };
  }

  c.badge = contestJSON.badge;
  c.medal = contestJSON.medal;
  c.organization = contestJSON.organization;

  c.group = contestJSON.group;
  c.tag = contestJSON.tag;

  c.banner = contestJSON.banner;

  c.logo = contestJSON.logo;
  c.boardLink = contestJSON.board_link;

  return c;
}
