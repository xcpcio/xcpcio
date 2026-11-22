import type { Rank } from "@xcpcio/core";
import {
  getAwardKey,
  getProblemColorClass,
  getProblemShow,
  getProblemSign,
  getStandClassName,
} from "@board/composables/standings";
import {
  buildFilterTeams,
  buildGiantTeams,
} from "@board/composables/useStandingsLists";
import {
  BattleOfGiants,
  GiantsType,
  MedalType,
  Problem,
  RankOptions,
  Team,
  TeamProblemStatistics,
} from "@xcpcio/core";
import { describe, expect, it } from "vitest";

const statusTimeDisplay = {
  correct: true,
  incorrect: true,
  pending: true,
};

function makeTeam(id: string, solved = 0, penalty = 0): Team {
  const team = new Team();
  team.id = id;
  team.solvedProblemNum = solved;
  team.penalty = penalty;
  return team;
}

function makeProblemStatistics(options: {
  id?: string;
  label?: string;
  isSolved?: boolean;
  isFirstSolved?: boolean;
  failedCount?: number;
  pendingCount?: number;
  totalCount?: number;
  lastSubmitTimestamp?: number;
} = {}): TeamProblemStatistics {
  const problem = new Problem();
  problem.id = options.id ?? "A";
  problem.label = options.label ?? "A";

  const statistics = new TeamProblemStatistics();
  statistics.problem = problem;
  statistics.isSolved = options.isSolved ?? false;
  statistics.isFirstSolved = options.isFirstSolved ?? false;
  statistics.failedCount = options.failedCount ?? 0;
  statistics.pendingCount = options.pendingCount ?? 0;
  statistics.totalCount = options.totalCount ?? 0;
  statistics.lastSubmitTimestamp = options.lastSubmitTimestamp ?? 0;

  return statistics;
}

function makeRank(overrides: Partial<Rank> = {}): Rank {
  return {
    teams: [],
    organizations: [],
    options: new RankOptions(),
    rankStatistics: {
      getTeamSolvedNumIndex: () => 1,
    },
    ...overrides,
  } as unknown as Rank;
}

describe("problem display helpers", () => {
  it("returns the problem sign", () => {
    expect(getProblemSign(makeProblemStatistics({ isSolved: true, failedCount: 2, totalCount: 3 }))).toBe("+");
    expect(getProblemSign(makeProblemStatistics({ failedCount: 2, totalCount: 2 }))).toBe("-");
    expect(getProblemSign(makeProblemStatistics({ pendingCount: 3, totalCount: 3 }))).toBe("? 3");
    expect(getProblemSign(makeProblemStatistics())).toBe("");
  });

  it("returns attempts and time according to status time display", () => {
    expect(getProblemShow(makeProblemStatistics(), statusTimeDisplay)).toBe("");
    expect(getProblemShow(
      makeProblemStatistics({ isSolved: true, failedCount: 2, totalCount: 3, lastSubmitTimestamp: 25 * 60 }),
      statusTimeDisplay,
    )).toBe("3/25");
    expect(getProblemShow(
      makeProblemStatistics({ isSolved: true, failedCount: 2, totalCount: 3, lastSubmitTimestamp: 25 * 60 }),
      { ...statusTimeDisplay, correct: false },
    )).toBe("3");
    expect(getProblemShow(
      makeProblemStatistics({ failedCount: 2, totalCount: 2, lastSubmitTimestamp: 10 * 60 }),
      statusTimeDisplay,
    )).toBe("2/10");
    expect(getProblemShow(
      makeProblemStatistics({ pendingCount: 1, totalCount: 1, lastSubmitTimestamp: 7 * 60 }),
      statusTimeDisplay,
    )).toBe("0/7");
  });

  it("maps the problem status to a colour class", () => {
    expect(getProblemColorClass(makeProblemStatistics({ isSolved: true, isFirstSolved: true }))).toBe("first-solve");
    expect(getProblemColorClass(makeProblemStatistics({ isSolved: true }))).toBe("correct");
    expect(getProblemColorClass(makeProblemStatistics({ failedCount: 1, totalCount: 1 }))).toBe("incorrect");
    expect(getProblemColorClass(makeProblemStatistics({ pendingCount: 1, totalCount: 1 }))).toBe("pending");
    expect(getProblemColorClass(makeProblemStatistics())).toBe("unattempted");
  });
});

describe("award and stand classes", () => {
  it("uses medal precedence", () => {
    const team = makeTeam("gold");
    team.awards = [MedalType.HONORABLE, MedalType.BRONZE, MedalType.SILVER, MedalType.GOLD];
    expect(getAwardKey(team)).toBe("gold");

    team.awards = [MedalType.HONORABLE, MedalType.SILVER];
    expect(getAwardKey(team)).toBe("silver");

    team.awards = [MedalType.HONORABLE];
    expect(getAwardKey(team)).toBe("honorable");
  });

  it("prefers the rank medal, then giants, then filter, then zebra", () => {
    const rank = makeRank();
    const team = makeTeam("t1");
    team.awards = [MedalType.GOLD];

    expect(getStandClassName(rank, team, 0, { isRankField: true })).toBe("gold");
    expect(getStandClassName(rank, team, 0, { giantsType: GiantsType.BLUE })).toBe("bg-blue-400");
    expect(getStandClassName(rank, team, 0, { giantsType: GiantsType.RED })).toBe("bg-red-400");
    expect(getStandClassName(rank, team, 0, { isFilter: true })).toBe("filter-team");
    expect(getStandClassName(rank, team, 1)).toBe("stand01");
  });
});

describe("standings lists", () => {
  it("filters teams by organization, team and team id", () => {
    const rank = makeRank();
    const organizationTeam = makeTeam("org-team");
    organizationTeam.organization = { id: "org-1" } as never;
    const team = makeTeam("team-1");
    const idTeam = makeTeam("team-2");
    rank.teams = [organizationTeam, team, idTeam];

    rank.options.filterOrganizationMap.set("org-1", { value: "org-1", text: "Org" });
    rank.options.filterTeamMap.set("team-1", { value: "team-1", text: "Team" });
    rank.options.filterTeamIdMap.set("team-2", { value: "team-2", text: "Team 2" });

    expect(buildFilterTeams(rank).map(t => t.id)).toEqual(["org-team", "team-1", "team-2"]);
  });

  it("builds the battle of giants with topX, equal teams and ordering", () => {
    const rank = makeRank();
    const battle = new BattleOfGiants();
    battle.topX = 2;
    battle.equalTeams = true;
    rank.options.battleOfGiants = battle;

    const blueOne = makeTeam("blue-1", 2, 100);
    const blueTwo = makeTeam("blue-2", 1, 200);
    const redOne = makeTeam("red-1", 3, 50);
    rank.teams = [redOne, blueTwo, blueOne];

    battle.blueTeam.setFilterTeams([
      { value: "blue-1", text: "Blue 1" },
      { value: "blue-2", text: "Blue 2" },
    ]);
    battle.redTeam.setFilterTeams([{ value: "red-1", text: "Red 1" }]);

    const giantTeams = buildGiantTeams(rank);
    expect(giantTeams.map(({ team, giantsType }) => [team.id, giantsType])).toEqual([
      ["red-1", GiantsType.RED],
      ["blue-2", GiantsType.BLUE],
    ]);
    expect(battle.blueTeam.teams.map(t => t.id)).toEqual(["blue-2"]);
    expect(battle.redTeam.teams.map(t => t.id)).toEqual(["red-1"]);

    expect(buildGiantTeams(rank)).toHaveLength(2);
  });
});
