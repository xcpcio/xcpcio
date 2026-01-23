import type { BannerMode, Contest as IContest, Image, Organizations as IOrganizations, MedalPreset, SocialMedia, StatusTimeDisplay } from "@xcpcio/types";
import type { Awards } from "./award";
import type { Organizations } from "./organization";
import type { Problem, Problems } from "./problem";

import { ContestState } from "@xcpcio/types";
import { Award, MedalType } from "./award";
import { I18nText } from "./basic-types";
import { ContestOptions, createContestOptions } from "./contest-options";
import { Group } from "./group";
import { createOrganizations } from "./organization";
import { createProblems, createProblemsByProblemIds } from "./problem";
import { createDayJS, dayjs, getTimeDiff } from "./utils";

export class Contest {
  id: string = "";
  name: I18nText;

  startTime: dayjs.Dayjs;
  endTime: dayjs.Dayjs;
  freezeTime: dayjs.Dayjs;

  replayStartTime?: dayjs.Dayjs;
  replayEndTime?: dayjs.Dayjs;
  replayFreezeTime?: dayjs.Dayjs;
  replayNowTime?: dayjs.Dayjs;
  replayContestStartTimestamp?: number;

  totalDurationTimestamp: number;
  freezeDurationTimestamp: number;
  unFreezeDurationTimestamp: number;

  penalty: number;

  problems: Problems;
  problemsMap: Map<string, Problem>;

  statusTimeDisplay: StatusTimeDisplay;

  medal?: Record<string, Record<string, number>> | MedalPreset;
  awards?: Awards;

  group: Map<string, Group>;
  tag: Map<string, string>;

  logo?: Image;
  banner?: Image;
  bannerMode?: BannerMode;
  boardLink?: string;
  socialMedia?: SocialMedia;

  options: ContestOptions;

  organizations?: Organizations;

  constructor() {
    this.name = new I18nText();

    this.startTime = createDayJS();
    this.endTime = createDayJS();
    this.freezeTime = createDayJS();

    this.totalDurationTimestamp = 0;
    this.freezeDurationTimestamp = 0;
    this.unFreezeDurationTimestamp = 0;

    // 20 mins
    this.penalty = 20 * 60;

    this.problems = [];
    this.problemsMap = new Map<string, Problem>();

    this.statusTimeDisplay = {
      correct: true,
      incorrect: true,
      pending: true,
    };

    this.group = new Map<string, Group>();
    this.tag = new Map<string, string>();

    this.options = new ContestOptions();
  }

  getStartTime() {
    return this.replayStartTime ?? this.startTime;
  }

  getEndTime() {
    return this.replayEndTime ?? this.endTime;
  }

  getFreezeTime() {
    return this.replayFreezeTime ?? this.freezeTime;
  }

  getContestDuration(timeFormat = "HH:mm:ss"): string {
    return dayjs.duration(this.getEndTime().diff(this.getStartTime())).format(timeFormat);
  }

  getContestState(nowTime?: Date): ContestState {
    const now = createDayJS(nowTime);

    if (now.isBefore(this.getStartTime())) {
      return ContestState.PENDING;
    }

    if (now.isSameOrAfter(this.getEndTime())) {
      return ContestState.FINISHED;
    }

    if (now.isSameOrAfter(this.getFreezeTime())) {
      return ContestState.FROZEN;
    }

    return ContestState.RUNNING;
  }

  getContestPendingTime(nowTime?: Date): string {
    let baseTime = createDayJS(nowTime);
    if (baseTime.isAfter(this.getStartTime())) {
      baseTime = this.getStartTime();
    }

    return getTimeDiff(Math.floor(dayjs.duration(this.getStartTime().diff(baseTime)).asSeconds()));
  }

  getContestElapsedTime(nowTime?: Date): string {
    let baseTime = createDayJS(nowTime);
    if (baseTime.isAfter(this.getEndTime())) {
      baseTime = this.getEndTime();
    }

    if (baseTime.isBefore(this.getStartTime())) {
      baseTime = this.getStartTime();
    }

    return getTimeDiff(Math.floor(dayjs.duration(baseTime.diff(this.getStartTime())).asSeconds()));
  }

  getContestRemainingTime(nowTime?: Date): string {
    let baseTime = createDayJS(nowTime);
    if (baseTime.isAfter(this.getEndTime())) {
      baseTime = this.getEndTime();
    }

    if (baseTime.isBefore(this.getStartTime())) {
      baseTime = this.getStartTime();
    }

    return getTimeDiff(Math.floor(dayjs.duration(this.getEndTime().diff(baseTime)).asSeconds()));
  }

  getContestProgressRatio(nowTime?: Date): number {
    const baseTime = createDayJS(nowTime);

    if (this.getStartTime().isSameOrAfter(baseTime)) {
      return 0;
    }

    if (this.getEndTime().isSameOrBefore(baseTime)) {
      return 100;
    }

    const total = this.getEndTime().diff(this.getStartTime(), "s");
    const pass = baseTime.diff(this.getStartTime(), "s");

    return Math.round((pass * 100) / total);
  }

  isEnableAwards(group: string): boolean {
    if (!this.awards) {
      return false;
    }

    if (!this.awards.has(group)) {
      return false;
    }

    return true;
  }

  resetReplayTime() {
    this.replayStartTime = undefined;
    this.replayEndTime = undefined;
    this.replayFreezeTime = undefined;
    this.replayNowTime = undefined;
    this.replayContestStartTimestamp = undefined;
  }

  setReplayTime(replayStartTimestamp: number) {
    if (replayStartTimestamp === 0) {
      this.resetReplayTime();
      return;
    }

    const replayStartTime = createDayJS(replayStartTimestamp);
    const diff = replayStartTime.diff(this.startTime, "s");

    this.replayStartTime = this.startTime.add(diff, "s");
    this.replayEndTime = this.endTime.add(diff, "s");
    this.replayFreezeTime = this.freezeTime.add(diff, "s");
    this.replayNowTime = createDayJS();
    this.replayContestStartTimestamp = this.replayNowTime.diff(this.replayStartTime, "s");
  }
}

export function createContest(contestJSON: IContest): Contest {
  const c = new Contest();

  c.name = I18nText.fromIText(contestJSON.contest_name);

  c.startTime = createDayJS(contestJSON.start_time);
  c.endTime = createDayJS(contestJSON.end_time);

  c.totalDurationTimestamp = c.endTime.unix() - c.startTime.unix();

  {
    // default value
    c.freezeTime = c.endTime;
    c.freezeDurationTimestamp = 0;

    if (contestJSON.frozen_time !== undefined && contestJSON.frozen_time != null) {
      const frozenTime = Number(contestJSON.frozen_time);

      c.freezeTime = createDayJS(c.endTime.unix() - frozenTime);
      c.freezeDurationTimestamp = frozenTime;
    }

    if (contestJSON.freeze_time !== undefined && contestJSON.freeze_time !== null) {
      c.freezeTime = createDayJS(contestJSON.freeze_time);
      c.freezeDurationTimestamp = c.endTime.unix() - c.freezeTime.unix();
    }

    c.unFreezeDurationTimestamp = c.totalDurationTimestamp - c.freezeDurationTimestamp;
  }

  c.penalty = contestJSON.penalty;

  {
    if (contestJSON.problem_id !== undefined && contestJSON.problem_id !== null) {
      c.problems = createProblemsByProblemIds(contestJSON.problem_id, contestJSON.balloon_color);
    }

    if (contestJSON.problems !== undefined && contestJSON.problems !== null) {
      c.problems = createProblems(contestJSON.problems);
    }

    c.problemsMap = new Map(c.problems.map(p => [p.id, p]));
  }

  if (contestJSON.status_time_display !== undefined && contestJSON.status_time_display !== null) {
    c.statusTimeDisplay = {
      correct: Boolean(contestJSON.status_time_display.correct ?? false),
      incorrect: Boolean(contestJSON.status_time_display.incorrect ?? false),
      pending: Boolean(contestJSON.status_time_display.pending ?? false),
    };
  }

  c.medal = contestJSON.medal;

  (() => {
    if (contestJSON.medal === undefined || contestJSON.medal === null) {
      return;
    }

    c.awards = new Map<string, Award[]>();

    if (typeof contestJSON.medal === "string") {
      // eslint-disable-next-line no-empty
      {}
    } else {
      for (const k in contestJSON.medal) {
        const v = contestJSON.medal[k];

        {
          const award: Award[] = [];

          let rank = 1;
          const work = (key: string, medalType: MedalType) => {
            if (Object.keys(v).includes(key)) {
              const a = new Award();
              a.medalType = medalType;
              a.minRank = rank;
              rank += Number(v[key]);
              a.maxRank = rank - 1;
              award.push(a);
            }
          };

          work("gold", MedalType.GOLD);
          work("silver", MedalType.SILVER);
          work("bronze", MedalType.BRONZE);

          {
            const a = new Award();
            a.medalType = MedalType.HONORABLE;
            a.minRank = rank;
            a.maxRank = 0x3F3F3F3F;
            award.push(a);
          }

          c.awards.set(k, award);
        }
      }
    }
  })();

  {
    const g = new Group();
    g.name.fallbackLang = "zh-CN";
    g.name.set("en", "All");
    g.name.set("zh-CN", "所有队伍");
    g.isDefault = true;

    c.group.set("all", g);
  }

  for (const [k, v] of Object.entries(contestJSON?.group ?? {})) {
    let key = k;

    const g = new Group();
    g.name.fallbackLang = "zh-CN";
    g.name.set("zh-CN", v);

    if (k === "official") {
      g.name.set("en", "Official");
    }

    if (k === "unofficial") {
      g.name.set("en", "Unofficial");
    }

    if (k === "girl" || k === "girls") {
      g.name.set("en", "Girls");
      key = "girl";
    }

    c.group.set(key, g);
  }

  c.banner = contestJSON.banner;
  if (c.banner) {
    c.bannerMode = contestJSON.banner_mode ?? "ALL";
  }

  c.logo = contestJSON.logo;
  c.boardLink = contestJSON.board_link;
  c.socialMedia = contestJSON.social_media;

  if (contestJSON.options) {
    c.options = createContestOptions(contestJSON.options);
  }

  if (contestJSON.organizations) {
    c.organizations = createOrganizations(contestJSON.organizations as IOrganizations);
  }

  return c;
}
export { ContestOptions };
