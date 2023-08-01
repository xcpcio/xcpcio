import { resolve } from "node:path";
import fs from "node:fs";
import { describe, expect, it } from "vitest";

import { createContestIndexList } from "../src/index";

describe("contest-index", () => {
  it("common", () => {
    const data = fs.readFileSync(resolve(__dirname, "test-data/contest-index.json"));
    const contestListJSON = JSON.parse(data.toString());
    const contestIndexList = createContestIndexList(contestListJSON);

    expect(contestIndexList.length).toMatchInlineSnapshot("257");
    expect(contestIndexList[0]).toMatchInlineSnapshot(`
      ContestIndex {
        "boardLink": "/provincial-contest/2023/shandong",
        "config": ContestIndexConfig {
          "contestName": "第十三届山东省 ICPC 大学生程序设计竞赛（正式赛）",
          "endTime": "2023-06-04T06:00:00.000Z",
          "freezeDurationTimestamp": 3600,
          "freezeTime": "2023-06-04T05:00:00.000Z",
          "logo": undefined,
          "startTime": "2023-06-04T01:00:00.000Z",
          "totalDurationTimestamp": 18000,
          "unFreezeDurationTimestamp": 14400,
        },
      }
    `);

    expect(contestIndexList.slice(-1)[0]).toMatchInlineSnapshot(`
      ContestIndex {
        "boardLink": "/icpc/2009/dhu_online",
        "config": ContestIndexConfig {
          "contestName": "ICPC 2009 上海赛区网络赛",
          "endTime": "2009-09-11T06:00:00.000Z",
          "freezeDurationTimestamp": 0,
          "freezeTime": "2009-09-11T06:00:00.000Z",
          "logo": undefined,
          "startTime": "2009-09-11T01:00:00.000Z",
          "totalDurationTimestamp": 18000,
          "unFreezeDurationTimestamp": 18000,
        },
      }
    `);
  });
});
