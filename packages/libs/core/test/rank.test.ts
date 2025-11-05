import fs from "node:fs";
import { resolve } from "node:path";
import { CodeforcesGymGhostDATConverter, createContest, createSubmissions, createTeams, Rank } from "@xcpcio/core";

import _ from "lodash";
import { describe, expect, it } from "vitest";

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
    const submissions = createSubmissions(runJSON, contest);

    const rank = new Rank(contest, teams, submissions);
    rank.buildRank();

    expect(rank.teams.length).toMatchInlineSnapshot("132");
    expect(rank.originTeams.length).toMatchInlineSnapshot("132");

    expect(rank.contest).matchSnapshot();
    expect(rank.options).matchSnapshot();
    expect(rank.rankStatistics).toMatchInlineSnapshot(`
      RankStatistics {
        "effectiveTeamNum": 128,
        "maxSolvedProblems": 11,
        "teamSolvedNum": [
          4,
          4,
          10,
          20,
          43,
          26,
          17,
          3,
          2,
          1,
          1,
          1,
          0,
          0,
        ],
        "teamSolvedNumIndex": [
          12,
          11,
          10,
          9,
          8,
          7,
          6,
          5,
          4,
          3,
          2,
          1,
          0,
          0,
        ],
        "totalTeamNum": 132,
      }
    `);

    const firstTeam = rank.teams[0];
    const lastTeam = rank.teams[rank.teams.length - 1];

    expect(firstTeam.rank).toMatchInlineSnapshot("1");
    expect(firstTeam.organization?.rank).toMatchInlineSnapshot(`1`);
    expect(firstTeam.isFirstRankOfOrganization).toMatchInlineSnapshot(`true`);

    expect(firstTeam.solvedProblemNum).toMatchInlineSnapshot("11");
    expect(firstTeam.penalty).toMatchInlineSnapshot("89820");
    expect(firstTeam.name).toMatchInlineSnapshot(`
      I18nText {
        "fallback": "重生之我是菜狗",
        "texts": Map {},
      }
    `);
    expect(firstTeam.organizationId).toMatchInlineSnapshot("\"北京大学\"");
    expect(firstTeam.organization?.name.getOrDefault()).toMatchInlineSnapshot("\"北京大学\"");

    expect(firstTeam.penaltyToMinute).toMatchInlineSnapshot("1497");
    expect(firstTeam.dirt).toMatchInlineSnapshot("52");

    expect(firstTeam.problemStatistics).matchSnapshot();
    expect(firstTeam.placeChartPoints.map(p => [p.timePoint, p.rank])).matchSnapshot();
    expect(firstTeam.awards).toMatchInlineSnapshot("[]");

    expect(lastTeam.rank).toMatchInlineSnapshot(`129`);
    expect(lastTeam.organization?.rank).toMatchInlineSnapshot(`114`);

    expect(lastTeam.solvedProblemNum).toMatchInlineSnapshot("0");
    expect(lastTeam.penalty).toMatchInlineSnapshot("0");
    expect(lastTeam.name).toMatchInlineSnapshot(`
      I18nText {
        "fallback": "红旗精英",
        "texts": Map {},
      }
    `);
    expect(lastTeam.organizationId).toMatchInlineSnapshot("\"一汽红旗\"");
    expect(lastTeam.organization?.name.getOrDefault()).toMatchInlineSnapshot("\"一汽红旗\"");

    expect(lastTeam.penaltyToMinute).toMatchInlineSnapshot("0");
    expect(lastTeam.dirt).toMatchInlineSnapshot("0");

    expect(lastTeam.problemStatistics).matchSnapshot();
    expect(lastTeam.placeChartPoints.map(p => [p.timePoint, p.rank])).matchSnapshot();
    expect(lastTeam.awards).toMatchInlineSnapshot("[]");

    {
      const converter = new CodeforcesGymGhostDATConverter();
      const dat = converter.convert(rank);
      expect(dat.length).toMatchInlineSnapshot(`44756`);
    }

    {
      const rank_ = _.cloneDeep(rank);
      rank_.buildBalloons();
      expect(rank_.balloons.length).toMatchInlineSnapshot("555");
    }
  });
});
