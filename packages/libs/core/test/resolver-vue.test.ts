import fs from "node:fs";
import { resolve } from "node:path";
import { createContest, createSubmissions, createTeams, ResolverVue } from "@xcpcio/core";
import { describe, expect, it } from "vitest";

function createResolverVue2023CcpcFinal() {
  const testDataDir = resolve(__dirname, "test-data/2023_ccpc_final");

  const contest = createContest(
    JSON.parse(fs.readFileSync(resolve(testDataDir, "config.json"), "utf-8")),
  );
  const teams = createTeams(
    JSON.parse(fs.readFileSync(resolve(testDataDir, "team.json"), "utf-8")),
  );
  const submissions = createSubmissions(
    JSON.parse(fs.readFileSync(resolve(testDataDir, "run.json"), "utf-8")),
    contest,
  );

  const resolver = new ResolverVue(contest, teams, submissions);
  resolver.buildResolver();

  return resolver;
}

describe("resolverVue", () => {
  it("applies the next operation when its team is below the highlighted row", () => {
    const resolver = createResolverVue2023CcpcFinal();
    const firstOpTeamRank = resolver.operations[0].team.rank;

    expect(firstOpTeamRank).toBeGreaterThan(1);
    expect(resolver.currentIndex).toBe(resolver.maxIndex);

    // Rewinding can leave tied teams in a different order, with the highlight
    // above the next operation's team. next() should move to that team and
    // apply the operation instead of stalling.
    resolver.currentIndex = 0;
    const opIndexBefore = resolver.currentOpIndex;

    resolver.next();

    expect(resolver.currentIndex).toBe(firstOpTeamRank - 1);
    expect(resolver.currentOpIndex).toBe(opIndexBefore + 1);
  });
});
