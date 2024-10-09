import fs from "node:fs";
import { resolve } from "node:path";
import _ from "lodash";

import { describe, expect, it } from "vitest";

import { createContest } from "../src/contest";
import { Rank } from "../src/rank";
import { Rating, RatingCalculator, RatingUser } from "../src/rating";
import { createSubmissions } from "../src/submission";
import { createTeams } from "../src/team";

describe("contest", () => {
  it("2023_ccpc_final", () => {
    const contestData = fs.readFileSync(resolve(__dirname, "test-data/2023_ccpc_final/config.json"));
    const teamData = fs.readFileSync(resolve(__dirname, "test-data/2023_ccpc_final/team.json"));
    const runData = fs.readFileSync(resolve(__dirname, "test-data/2023_ccpc_final/run.json"));

    const contestJSON = JSON.parse(contestData.toString());
    const teamJSON = JSON.parse(teamData.toString());
    const runJSON = JSON.parse(runData.toString());

    const contest = createContest(contestJSON);
    const teams = createTeams(teamJSON);
    const submissions = createSubmissions(runJSON);

    const rank = new Rank(contest, teams, submissions);
    rank.contest.id = "2023/ccpc/final";
    rank.buildRank();

    expect(rank.teams.length).toMatchInlineSnapshot("132");
    expect(rank.originTeams.length).toMatchInlineSnapshot("132");

    {
      const ratingCalculator = new RatingCalculator();
      for (const t of rank.teams) {
        const u = new RatingUser();
        u.id = t.id;
        u.rank = t.rank;
        u.oldRating = 1500;
        ratingCalculator.users.push(u);
      }

      ratingCalculator.calculate();
      const firstUser = ratingCalculator.users[0];
      expect(firstUser.rank).toMatchInlineSnapshot("1");
      expect(firstUser.rating).toMatchInlineSnapshot("1714");

      const lastUser = ratingCalculator.users.at(-1)!;
      expect(lastUser.rank).toMatchInlineSnapshot("129");
      expect(lastUser.rating).toMatchInlineSnapshot("1402");

      for (const u of ratingCalculator.users) {
        u.oldRating = u.rating;
      }

      ratingCalculator.calculate();

      expect(firstUser.rank).toMatchInlineSnapshot("1");
      expect(firstUser.rating).toMatchInlineSnapshot("1861");

      expect(lastUser.rank).toMatchInlineSnapshot("129");
      expect(lastUser.rating).toMatchInlineSnapshot("1312");
    }

    {
      const rating = new Rating();
      rating.id = "2023/ccpc/final";
      rating.name = rating.id;
      rating.contestIDs.push(rank.contest.id);

      rating.ranks.push(_.cloneDeep(rank));
      rating.ranks.push(_.cloneDeep(rank));
      rating.ranks.push(_.cloneDeep(rank));
      rating.buildRating();

      expect(rating.users.length).toMatchInlineSnapshot("132");

      const firstUser = rating.users[0];
      const lastUser = rating.users.at(-1)!;

      expect(firstUser.ratingHistories.length).toMatchInlineSnapshot("3");
      expect(firstUser.rating).toMatchInlineSnapshot("1973");
      expect(firstUser.minRating).toMatchInlineSnapshot("1500");
      expect(firstUser.maxRating).toMatchInlineSnapshot("1973");

      expect(lastUser.ratingHistories.length).toMatchInlineSnapshot("3");
      expect(lastUser.rating).toMatchInlineSnapshot("1227");
      expect(lastUser.minRating).toMatchInlineSnapshot("1227");
      expect(lastUser.maxRating).toMatchInlineSnapshot("1500");

      {
        const newRating = Rating.fromJSON(JSON.stringify(rating));
        expect(newRating.id).toMatchInlineSnapshot("\"2023/ccpc/final\"");
        expect(newRating.name).toMatchInlineSnapshot("\"2023/ccpc/final\"");
        expect(newRating.baseRating).toMatchInlineSnapshot("1500");
        expect(newRating.contestIDs).toMatchInlineSnapshot(`
          [
            "2023/ccpc/final",
          ]
        `);
        expect(newRating.users.length).toMatchInlineSnapshot("132");
        expect(newRating.users[0]).toMatchInlineSnapshot(`
          {
            "coaches": [],
            "id": "王展鹏|罗煜翔|蒋凌宇",
            "maxRating": 1973,
            "members": [
              {
                "name": "王展鹏",
              },
              {
                "name": "罗煜翔",
              },
              {
                "name": "蒋凌宇",
              },
            ],
            "minRating": 1500,
            "name": "重生之我是菜狗",
            "organization": "北京大学",
            "rating": 1973,
            "ratingHistories": [
              {
                "coaches": [],
                "contestID": "2023/ccpc/final",
                "contestLink": "2023/ccpc/final",
                "contestName": "第八届中国大学生程序设计竞赛总决赛（正式赛）",
                "contestTime": 2023-05-14T01:10:00.000Z,
                "members": [
                  {
                    "name": "王展鹏",
                  },
                  {
                    "name": "罗煜翔",
                  },
                  {
                    "name": "蒋凌宇",
                  },
                ],
                "organization": "北京大学",
                "rank": 1,
                "rating": 1714,
                "teamName": "重生之我是菜狗",
              },
              {
                "coaches": [],
                "contestID": "2023/ccpc/final",
                "contestLink": "2023/ccpc/final",
                "contestName": "第八届中国大学生程序设计竞赛总决赛（正式赛）",
                "contestTime": 2023-05-14T01:10:00.000Z,
                "members": [
                  {
                    "name": "王展鹏",
                  },
                  {
                    "name": "罗煜翔",
                  },
                  {
                    "name": "蒋凌宇",
                  },
                ],
                "organization": "北京大学",
                "rank": 1,
                "rating": 1861,
                "teamName": "重生之我是菜狗",
              },
              {
                "coaches": [],
                "contestID": "2023/ccpc/final",
                "contestLink": "2023/ccpc/final",
                "contestName": "第八届中国大学生程序设计竞赛总决赛（正式赛）",
                "contestTime": 2023-05-14T01:10:00.000Z,
                "members": [
                  {
                    "name": "王展鹏",
                  },
                  {
                    "name": "罗煜翔",
                  },
                  {
                    "name": "蒋凌宇",
                  },
                ],
                "organization": "北京大学",
                "rank": 1,
                "rating": 1973,
                "teamName": "重生之我是菜狗",
              },
            ],
          }
        `);
      }
    }
  });
});
