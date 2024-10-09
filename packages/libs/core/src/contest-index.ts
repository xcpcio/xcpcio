import type { Contest as IContest, ContestIndex as IContestIndex, Image } from "@xcpcio/types";
import type dayjs from "dayjs";

import { Contest, createContest } from "./contest";
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
  contest: Contest;
  boardLink: string;

  constructor() {
    this.contest = new Contest();
    this.boardLink = "";
  }
}

export type ContestIndexList = Array<ContestIndex>;

export function createContestIndex(contestIndexJSON: IContestIndex): ContestIndex {
  const c = new ContestIndex();
  const cjc = contestIndexJSON.config;

  c.contest = createContest(cjc as IContest);
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
    if (a.contest.startTime.isBefore(b.contest.startTime)) {
      return 1;
    }

    if (a.contest.startTime.isAfter(b.contest.startTime)) {
      return -1;
    }

    if (a.contest.endTime.isBefore(b.contest.endTime)) {
      return 1;
    }

    if (a.contest.endTime.isAfter(b.contest.endTime)) {
      return -1;
    }

    if (a.contest.name < b.contest.name) {
      return 1;
    }

    if (a.contest.name > b.contest.name) {
      return -1;
    }

    return 0;
  });

  return contestIndexList;
}
