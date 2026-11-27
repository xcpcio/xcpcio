import type { Contest as IContest, Team as ITeam, MedalAward } from "@xcpcio/types";

import { createContest, createTeams, MedalType, Rank } from "@xcpcio/core";
import { MedalAwardType } from "@xcpcio/types";

import { describe, expect, it } from "vitest";

function buildContest(medal: IContest["medal"]): IContest {
  return {
    contest_name: "Medal Test",
    start_time: 1700000000,
    end_time: 1700000000 + 5 * 60 * 60,
    penalty: 20 * 60,
    problems: [
      { id: "A", label: "A" },
      { id: "B", label: "B" },
    ],
    medal,
  };
}

const teamsJSON: ITeam[] = [
  { id: "t1", name: "Team 1" },
  { id: "t2", name: "Team 2" },
  { id: "t3", name: "Team 3" },
  { id: "t4", name: "Team 4" },
  { id: "t5", name: "Team 5" },
  { id: "t6", name: "Team 6", icpc_id: "T6" },
];

function buildRank(medal: IContest["medal"]) {
  const contest = createContest(buildContest(medal));
  const rank = new Rank(contest, createTeams(teamsJSON), []);
  rank.buildRank();

  const awardsByTeamID = new Map(
    rank.teams.map(t => [t.id, t.awards]),
  );

  return { contest, rank, awardsByTeamID };
}

describe("medal awards", () => {
  it("assigns medals to the listed team ids", () => {
    const awardList: MedalAward[] = [
      { award: MedalAwardType.GOLD, group: "official", team_ids: ["t1", "t2"] },
      { award: MedalAwardType.SILVER, group: "official", team_ids: ["t3"] },
      { award: MedalAwardType.BRONZE, group: "girl", team_ids: ["t4", "T6"] },
      { award: MedalAwardType.HONORABLE, team_ids: ["t5"] },
    ];

    const { contest, awardsByTeamID } = buildRank(awardList);

    expect(contest.teamMedals).toBeInstanceOf(Map);
    expect(contest.teamMedals?.get("t1")).toBe(MedalType.GOLD);
    expect(contest.teamMedals?.get("t2")).toBe(MedalType.GOLD);
    expect(contest.teamMedals?.get("t3")).toBe(MedalType.SILVER);
    expect(contest.teamMedals?.get("t4")).toBe(MedalType.BRONZE);
    expect(contest.teamMedals?.get("T6")).toBe(MedalType.BRONZE);

    // Applied regardless of the selected rank group, including the default
    // "all" one.
    expect(awardsByTeamID.get("t1")).toEqual([MedalType.GOLD]);
    expect(awardsByTeamID.get("t2")).toEqual([MedalType.GOLD]);
    expect(awardsByTeamID.get("t3")).toEqual([MedalType.SILVER]);
    expect(awardsByTeamID.get("t4")).toEqual([MedalType.BRONZE]);
    expect(awardsByTeamID.get("t5")).toEqual([MedalType.HONORABLE]);
    // `icpc_id` is used when the award references it instead of the team id.
    expect(awardsByTeamID.get("t6")).toEqual([MedalType.BRONZE]);

    expect(contest.isEnableAwards("all")).toBe(true);
    expect(contest.awards).toBeUndefined();
    expect(contest.medal).toEqual(awardList);
  });

  it("maps placement awards to medal colors", () => {
    const { awardsByTeamID } = buildRank([
      { award: MedalAwardType.CHAMPION, group: "official", team_ids: ["t1"] },
      { award: MedalAwardType.RUNNER_UP, group: "official", team_ids: ["t2"] },
      { award: MedalAwardType.SECOND_RUNNER_UP, group: "official", team_ids: ["t3"] },
    ] satisfies MedalAward[]);

    expect(awardsByTeamID.get("t1")).toEqual([MedalType.GOLD]);
    expect(awardsByTeamID.get("t2")).toEqual([MedalType.SILVER]);
    expect(awardsByTeamID.get("t3")).toEqual([MedalType.BRONZE]);
  });

  it("keeps only the highest medal when a team appears in several awards", () => {
    const { awardsByTeamID } = buildRank([
      { award: MedalAwardType.BRONZE, group: "official", team_ids: ["t1"] },
      { award: MedalAwardType.GOLD, group: "girl", team_ids: ["t1"] },
      { award: MedalAwardType.SILVER, group: "official", team_ids: ["t2"] },
      { award: MedalAwardType.BRONZE, group: "girl", team_ids: ["t2"] },
    ] satisfies MedalAward[]);

    expect(awardsByTeamID.get("t1")).toEqual([MedalType.GOLD]);
    expect(awardsByTeamID.get("t2")).toEqual([MedalType.SILVER]);
  });

  it("ignores unknown award types", () => {
    const { contest } = buildRank([
      { award: "platinum" as MedalAwardType, group: "official", team_ids: ["t1"] },
    ] satisfies MedalAward[]);

    expect(contest.teamMedals?.size).toBe(0);
    expect(contest.isEnableAwards("all")).toBe(false);
  });

  it("still supports count based medals", () => {
    const contest = createContest(buildContest({ official: { gold: 1, silver: 1 } }));
    const rank = new Rank(contest, createTeams(teamsJSON), []);
    rank.buildRank();

    expect(contest.teamMedals).toBeUndefined();
    expect(contest.awards?.get("official")).toHaveLength(3);
    expect(rank.teams.every(t => t.awards.length === 0)).toBe(true);
  });
});
