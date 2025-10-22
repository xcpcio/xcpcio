import fs from "node:fs";
import { resolve } from "node:path";
import { createTeams } from "@xcpcio/core";

import { describe, expect, it } from "vitest";

describe("team", () => {
  it("2023_ccpc_final", () => {
    const data = fs.readFileSync(resolve(__dirname, "test-data/2023_ccpc_final/team.json"));
    const teamsJSON = JSON.parse(data.toString());
    const teams = createTeams(teamsJSON);

    expect(teams[0]).toMatchInlineSnapshot(`
      Team {
        "attemptedProblemNum": 0,
        "awards": [],
        "badge": undefined,
        "coaches": [],
        "group": [
          "official",
        ],
        "id": "3000202305140115",
        "lastSolvedProblem": null,
        "lastSolvedProblemStatistics": null,
        "members": [
          Person {
            "name": I18nText {
              "fallback": "江骏扬",
              "texts": Map {},
            },
          },
          Person {
            "name": I18nText {
              "fallback": "罗昊",
              "texts": Map {},
            },
          },
          Person {
            "name": I18nText {
              "fallback": "辜飞云",
              "texts": Map {},
            },
          },
        ],
        "missingPhoto": false,
        "name": I18nText {
          "fallback": "前面的题目以后再来探索吧？",
          "texts": Map {},
        },
        "organization": "重庆邮电大学",
        "organizationRank": -1,
        "originalRank": 0,
        "penalty": 0,
        "photo": undefined,
        "placeChartPoints": [],
        "problemStatistics": [],
        "problemStatisticsMap": Map {},
        "rank": 0,
        "se": 0,
        "solvedProblemNum": 0,
        "submissions": [],
        "tag": [],
      }
    `);
    expect(teams.length).toMatchInlineSnapshot("132");
    expect(JSON.stringify(teams)).toMatchSnapshot();
  });
});
