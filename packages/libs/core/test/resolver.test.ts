import fs from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

import { createContest } from "../src/contest";
import { Resolver } from "../src/resolver";
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
    const submissions = createSubmissions(runJSON, contest);

    const resolver = new Resolver(contest, teams, submissions);
    resolver.buildResolver();

    expect(resolver.operations.length).toMatchInlineSnapshot("203");

    expect(resolver.operations[0].id).toMatchInlineSnapshot("0");
    expect(resolver.operations[0].problemIx).toMatchInlineSnapshot("4");
    expect(resolver.operations[0].team.name).toMatchInlineSnapshot("\"红旗精英\"");
    expect(resolver.operations[0]).toMatchSnapshot();

    expect(resolver.operations.slice(-1)[0].id).toMatchInlineSnapshot("202");
    expect(resolver.operations.slice(-1)[0].team.name).toMatchInlineSnapshot("\"重生之我是菜狗\"");
    expect(resolver.operations.slice(-1)[0].problemIx).toMatchInlineSnapshot("8");
    expect(resolver.operations.slice(-1)[0].beforeTeamProblemStatistics.pendingCount).toMatchInlineSnapshot("2");
    expect(resolver.operations.slice(-1)[0].afterTeamProblemStatistics.isAccepted).toMatchInlineSnapshot("true");
    expect(resolver.operations.slice(-1)[0].afterTeamProblemStatistics.penalty).toMatchInlineSnapshot("18660");
    expect(resolver.operations.slice(-1)[0]).matchSnapshot();
  });
});
