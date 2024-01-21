import { resolve } from "node:path";
import fs from "node:fs";
import { describe, expect, it } from "vitest";

import { createContest } from "../src/contest";
import { createTeams } from "../src/team";
import { createSubmissions } from "../src/submission";
import { Rank } from "../src/rank";
import { RatingCalculator, RatingUser } from "../src/rating";

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

    const lastUser = ratingCalculator.users[ratingCalculator.users.length - 1];
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
  });
});
