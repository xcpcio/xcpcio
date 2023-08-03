import type dayjs from "dayjs";

import type { ContestIndex as IContestIndex, Image } from "@xcpcio/types";

import { createDayJS } from "./utils";

export class ContestIndexConfig {
  contestName: string;

  startTime: dayjs.Dayjs;
  endTime: dayjs.Dayjs;
  freezeTime: dayjs.Dayjs;

  totalDurationTimestamp: number;
  freezeDurationTimestamp: number;
  unFreezeDurationTimestamp: number;

  logo?: Image;

  constructor() {
    this.contestName = "";

    this.startTime = createDayJS();
    this.endTime = createDayJS();
    this.freezeTime = createDayJS();

    this.totalDurationTimestamp = 0;
    this.freezeDurationTimestamp = 0;
    this.unFreezeDurationTimestamp = 0;
  }
}

export class ContestIndex {
  config: ContestIndexConfig;
  boardLink: string;

  constructor() {
    this.config = new ContestIndexConfig();
    this.boardLink = "";
  }
}

export type ContestIndexList = Array<ContestIndex>;

export function createContestIndex(contestIndexJSON: IContestIndex): ContestIndex {
  const c = new ContestIndex();
  const cc = c.config;
  const cjc = contestIndexJSON.config;

  cc.contestName = cjc.contest_name;

  cc.startTime = createDayJS(cjc.start_time);
  cc.endTime = createDayJS(cjc.end_time);

  cc.totalDurationTimestamp = cc.endTime.unix() - cc.startTime.unix();

  {
    // default value
    cc.freezeTime = cc.endTime;
    cc.freezeDurationTimestamp = 0;

    if (cjc.frozen_time !== undefined && cjc.frozen_time != null) {
      const frozenTime = Number(cjc.frozen_time);

      cc.freezeTime = createDayJS(cc.endTime.unix() - frozenTime);
      cc.freezeDurationTimestamp = frozenTime;
    }

    cc.unFreezeDurationTimestamp = cc.totalDurationTimestamp - cc.freezeDurationTimestamp;
  }

  cc.logo = cjc.logo;

  c.boardLink = contestIndexJSON.board_link;

  return c;
}

export function createContestIndexList(contestListJSON: any): ContestIndexList {
  const contestIndexList = [] as ContestIndexList;

  const dfs = (contestList: any) => {
    if (Object.prototype.hasOwnProperty.call(contestList, "config")) {
      contestIndexList.push(createContestIndex(contestList));
    } else {
      for (const k in contestList) {
        dfs(contestList[k]);
      }
    }
  };

  dfs(contestListJSON);

  contestIndexList.sort((a: ContestIndex, b: ContestIndex) => {
    if (a.config.startTime.isBefore(b.config.startTime)) {
      return 1;
    }

    if (a.config.startTime.isAfter(b.config.startTime)) {
      return -1;
    }

    if (a.config.endTime.isBefore(b.config.endTime)) {
      return 1;
    }

    if (a.config.endTime.isAfter(b.config.endTime)) {
      return -1;
    }

    if (a.config.contestName < b.config.contestName) {
      return 1;
    }

    if (a.config.contestName > b.config.contestName) {
      return -1;
    }

    return 0;
  });

  return contestIndexList;
}
