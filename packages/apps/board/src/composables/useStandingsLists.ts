import type { Rank, RankOptions, Team, Teams } from "@xcpcio/core";
import type { ComputedRef, MaybeRefOrGetter } from "vue";
import { GiantsType, Team as TeamClass } from "@xcpcio/core";
import { computed, toRef } from "vue";

export interface GiantTeam {
  team: Team;
  giantsType: GiantsType;
}

export function buildFilterTeams(rank: Rank): Teams {
  return rank.teams.filter((team) => {
    if (rank.organizations && team.organization) {
      if (rank.options.filterOrganizationMap.has(team.organization.id)) {
        return true;
      }
    }

    if (rank.options.filterTeamMap.has(team.id)) {
      return true;
    }

    if (rank.options.filterTeamIdMap.has(team.id)) {
      return true;
    }

    return false;
  });
}

export function buildGiantTeams(rank: Rank): GiantTeam[] {
  const battleOfGiants = rank.options.battleOfGiants;
  const blueTeam = battleOfGiants.blueTeam;
  const redTeam = battleOfGiants.redTeam;
  blueTeam.teams = [];
  redTeam.teams = [];

  let blueCnt = 0;
  let redCnt = 0;

  for (const team of rank.teams) {
    const giantsType = (() => {
      if (
        (!!team.organization && blueTeam.filterOrganizationMap.has(team.organization.id))
        || blueTeam.filterTeamMap.has(team.id)
      ) {
        if (blueCnt >= battleOfGiants.topX) {
          return null;
        }

        blueCnt++;
        return GiantsType.BLUE;
      }

      if (
        (!!team.organization && redTeam.filterOrganizationMap.has(team.organization.id))
        || redTeam.filterTeamMap.has(team.id)
      ) {
        if (redCnt >= battleOfGiants.topX) {
          return null;
        }

        redCnt++;
        return GiantsType.RED;
      }

      return null;
    })();

    if (giantsType === null) {
      continue;
    }

    if (giantsType === GiantsType.BLUE) {
      blueTeam.teams.push(team);
    } else {
      redTeam.teams.push(team);
    }

    if (blueCnt === battleOfGiants.topX && redCnt === battleOfGiants.topX) {
      break;
    }
  }

  if (battleOfGiants.equalTeams) {
    while (blueTeam.teams.length < redTeam.teams.length) {
      redTeam.teams.pop();
    }
    while (redTeam.teams.length < blueTeam.teams.length) {
      blueTeam.teams.pop();
    }
  }

  const res: GiantTeam[] = [...blueTeam.teams.map(team => ({
    team,
    giantsType: GiantsType.BLUE,
  })), ...redTeam.teams.map(team => ({
    team,
    giantsType: GiantsType.RED,
  }))];

  res.sort((lhs, rhs) => TeamClass.compare(lhs.team, rhs.team));

  return res;
}

export interface StandingsLists {
  rankOptions: ComputedRef<RankOptions>;
  teams: ComputedRef<Teams>;
  filterTeams: ComputedRef<Teams>;
  giantTeams: ComputedRef<GiantTeam[]>;
}

export function useStandingsLists(rank: MaybeRefOrGetter<Rank>): StandingsLists {
  const rankRef = toRef(rank);

  return {
    rankOptions: computed(() => rankRef.value.options),
    teams: computed(() => rankRef.value.teams),
    filterTeams: computed(() => buildFilterTeams(rankRef.value)),
    giantTeams: computed(() => buildGiantTeams(rankRef.value)),
  };
}
