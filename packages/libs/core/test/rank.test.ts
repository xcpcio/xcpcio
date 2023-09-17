import { resolve } from "node:path";
import fs from "node:fs";
import { describe, expect, it } from "vitest";

import { createContest } from "../src/contest";
import { createTeams } from "../src/team";
import { createSubmissions } from "../src/submission";
import { Rank } from "../src/rank";

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
    rank.buildRank();

    expect(rank.teams.length).toMatchInlineSnapshot("132");
    expect(rank.originTeams.length).toMatchInlineSnapshot("132");

    expect(rank.contest).matchSnapshot();
    expect(rank.options).matchSnapshot();
    expect(rank.rankStatistics).toMatchInlineSnapshot(`
      RankStatistics {
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
      }
    `);

    const firstTeam = rank.teams[0];
    const lastTeam = rank.teams[rank.teams.length - 1];

    expect(firstTeam.rank).toMatchInlineSnapshot("1");
    expect(firstTeam.organizationRank).toMatchInlineSnapshot("1");

    expect(firstTeam.solvedProblemNum).toMatchInlineSnapshot("11");
    expect(firstTeam.penalty).toMatchInlineSnapshot("89820");
    expect(firstTeam.name).toMatchInlineSnapshot("\"重生之我是菜狗\"");
    expect(firstTeam.organization).toMatchInlineSnapshot("\"北京大学\"");

    expect(firstTeam.penaltyToMinute).toMatchInlineSnapshot("1497");
    expect(firstTeam.dict).toMatchInlineSnapshot("52");

    expect(firstTeam.problemStatistics).matchSnapshot();
    expect(firstTeam.placeChartPoints.map(p => [p.timePoint, p.rank])).matchSnapshot();

    expect(lastTeam.rank).toMatchInlineSnapshot("129");
    expect(lastTeam.organizationRank).toMatchInlineSnapshot("-1");

    expect(lastTeam.solvedProblemNum).toMatchInlineSnapshot("0");
    expect(lastTeam.penalty).toMatchInlineSnapshot("0");
    expect(lastTeam.name).toMatchInlineSnapshot("\"红旗精英\"");
    expect(lastTeam.organization).toMatchInlineSnapshot("\"一汽红旗\"");

    expect(lastTeam.penaltyToMinute).toMatchInlineSnapshot("0");
    expect(lastTeam.dict).toMatchInlineSnapshot("0");

    expect(lastTeam.problemStatistics).matchSnapshot();
    expect(lastTeam.placeChartPoints.map(p => [p.timePoint, p.rank])).matchSnapshot();
  });
});
