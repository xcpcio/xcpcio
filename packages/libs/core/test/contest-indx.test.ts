import fs from "node:fs";
import { resolve } from "node:path";
import { createContestIndexList } from "@xcpcio/core";

import { describe, expect, it } from "vitest";

describe("contest-index", () => {
  it("common", () => {
    const data = fs.readFileSync(resolve(__dirname, "test-data/contest-index.json"));
    const contestListJSON = JSON.parse(data.toString());
    const contestIndexList = createContestIndexList(contestListJSON);

    expect(contestIndexList.length).toMatchInlineSnapshot("257");
    expect(contestIndexList[0]).toMatchInlineSnapshot(`
      ContestIndex {
        "boardLink": "/provincial-contest/2023/shandong",
        "contest": Contest {
          "banner": undefined,
          "boardLink": undefined,
          "endTime": "2023-06-04T06:00:00.000Z",
          "freezeDurationTimestamp": 3600,
          "freezeTime": "2023-06-04T05:00:00.000Z",
          "group": Map {
            "all" => Group {
              "isDefault": true,
              "name": I18nText {
                "fallbackLang": "zh-CN",
                "texts": Map {
                  "en" => "All",
                  "zh-CN" => "所有队伍",
                },
              },
            },
          },
          "id": "",
          "logo": {
            "base64": "
      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
      ",
          },
          "medal": undefined,
          "name": I18nText {
            "fallback": "第十三届山东省 ICPC 大学生程序设计竞赛（正式赛）",
            "texts": Map {},
          },
          "options": ContestOptions {
            "calculationOfPenalty": "in_minutes",
            "enableOrganization": false,
            "submissionEnableActionField": false,
            "submissionHasExternalUrlField": false,
            "submissionHasLanguageField": false,
            "submissionHasReactionField": false,
            "submissionHasTimeField": false,
            "submissionTimestampUnit": "second",
          },
          "organization": undefined,
          "penalty": undefined,
          "problems": [],
          "problemsMap": Map {},
          "startTime": "2023-06-04T01:00:00.000Z",
          "statusTimeDisplay": {
            "correct": true,
            "incorrect": true,
            "pending": true,
          },
          "tag": Map {},
          "totalDurationTimestamp": 18000,
          "unFreezeDurationTimestamp": 14400,
        },
      }
    `);

    expect(contestIndexList.slice(-1)[0]).toMatchInlineSnapshot(`
      ContestIndex {
        "boardLink": "/icpc/2009/dhu_online",
        "contest": Contest {
          "banner": undefined,
          "boardLink": undefined,
          "endTime": "2009-09-11T06:00:00.000Z",
          "freezeDurationTimestamp": 0,
          "freezeTime": "2009-09-11T06:00:00.000Z",
          "group": Map {
            "all" => Group {
              "isDefault": true,
              "name": I18nText {
                "fallbackLang": "zh-CN",
                "texts": Map {
                  "en" => "All",
                  "zh-CN" => "所有队伍",
                },
              },
            },
          },
          "id": "",
          "logo": undefined,
          "medal": undefined,
          "name": I18nText {
            "fallback": "ICPC 2009 上海赛区网络赛",
            "texts": Map {},
          },
          "options": ContestOptions {
            "calculationOfPenalty": "in_minutes",
            "enableOrganization": false,
            "submissionEnableActionField": false,
            "submissionHasExternalUrlField": false,
            "submissionHasLanguageField": false,
            "submissionHasReactionField": false,
            "submissionHasTimeField": false,
            "submissionTimestampUnit": "second",
          },
          "organization": undefined,
          "penalty": undefined,
          "problems": [],
          "problemsMap": Map {},
          "startTime": "2009-09-11T01:00:00.000Z",
          "statusTimeDisplay": {
            "correct": true,
            "incorrect": true,
            "pending": true,
          },
          "tag": Map {},
          "totalDurationTimestamp": 18000,
          "unFreezeDurationTimestamp": 18000,
        },
      }
    `);
  });
});
