<script setup lang="ts">
import type { Rank } from "@xcpcio/core";
import type { Lang } from "@xcpcio/types";
import { GiantsType, Team } from "@xcpcio/core";

const props = defineProps<{
  rank: Rank;
}>();

const { t, locale } = useI18n();
const lang = computed(() => locale.value as unknown as Lang);

const rank = computed(() => props.rank);
const teams = computed(() => props.rank.teams);
const rankOptions = computed(() => props.rank.options);

const filterTeams = computed(() => {
  const res = props.rank.teams.filter((t) => {
    if (props.rank.organizations && t.organization) {
      if (props.rank.options.filterOrganizationMap.has(t.organization.id)) {
        return true;
      }
    }

    if (props.rank.options.filterTeamMap.has(t.id)) {
      return true;
    }

    return false;
  });

  return res;
});

interface GiantTeam {
  team: Team;
  giantsType: GiantsType;
}

const giantTeams = computed(() => {
  const battleOfGiants = rankOptions.value.battleOfGiants;
  const blueTeam = battleOfGiants.blueTeam;
  const redTeam = battleOfGiants.redTeam;
  blueTeam.teams = [];
  redTeam.teams = [];

  let blueCnt = 0;
  let redCnt = 0;

  for (const t of props.rank.teams) {
    const giantsType = (() => {
      if (
        (!!t.organization && blueTeam.filterOrganizationMap.has(t.organization.id))
        || blueTeam.filterTeamMap.has(t.id)
      ) {
        if (blueCnt >= battleOfGiants.topX) {
          return null;
        }

        blueCnt++;
        return GiantsType.BLUE;
      }

      if (
        (!!t.organization && redTeam.filterOrganizationMap.has(t.organization.id))
        || redTeam.filterTeamMap.has(t.id)
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
      blueTeam.teams.push(t);
    } else {
      redTeam.teams.push(t);
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

  const res: GiantTeam[] = [...blueTeam.teams.map((t) => {
    return {
      team: t,
      giantsType: GiantsType.BLUE,
    };
  }), ...redTeam.teams.map((t) => {
    return {
      team: t,
      giantsType: GiantsType.RED,
    };
  })];

  res.sort((lhs, rhs) => {
    return Team.compare(lhs.team, rhs.team);
  });

  return res;
});

const maxOrgLength = computed(() => {
  let res = 0;
  rank.value.teams.forEach((t) => {
    if (t.organization) {
      res = Math.max(res, t.organization.name.getOrDefault(lang.value).length);
    }
  });

  return res;
});

const maxTeamLength = computed(() => {
  let res = 0;
  rank.value.teams.forEach((t) => {
    res = Math.max(res, t.name.getOrDefault(lang.value).length);
  });

  return res;
});
</script>

<template>
  <div>
    <div
      v-if="rankOptions.battleOfGiants.enable"
      mb-4
    >
      <GiantsScoreBoard
        :battle-of-giants="rankOptions.battleOfGiants"
      />
    </div>

    <div>
      <table
        class="standings"
        font-mono dark:text-gray-700
      >
        <thead
          class="sticky top-0 z-99"
        >
          <tr>
            <th
              class="title"
              style="width: 3rem;"
            >
              {{ t("standings.place") }}
            </th>
            <th
              v-if="rank.contest.badge"
              class="title"
              style="width: 2.5rem;"
            >
              {{ rank.contest.badge }}
            </th>
            <th
              v-if="rank.contest.organization"
              class="title"
              :style="{ width: `${Math.min(32, Math.ceil(maxOrgLength * 1.1))}rem` }"
            >
              {{ rank.contest.organization }}
            </th>
            <th
              class="title"
              :style="{ width: `${Math.min(32, Math.ceil(maxTeamLength * 1))}rem` }"
            >
              {{ t("standings.team") }}
            </th>
            <th
              class="title"
              style="width: 3rem;"
            >
              {{ t("standings.solved") }}
            </th>
            <th
              class="title"
              style="width: 4rem;"
            >
              {{ t("standings.penalty") }}
            </th>
            <template
              v-for="p in rank.contest.problems"
              :key="`problem-block-${p.id}`"
            >
              <ProblemBlock
                :rank="rank"
                :problem="p"
              />
            </template>

            <th class="title" style="width: 2.5rem;">
              <Tooltip
                placement="top"
              >
                <div>
                  {{ t("standings.dirt") }}
                </div>

                <template #popper>
                  <div>
                    number of submits on the
                    <br>
                    all solved problems / number
                    <br>
                    of the solved problems
                  </div>
                </template>
              </Tooltip>
            </th>

            <th class="title" style="width: 2.5rem;">
              <Tooltip
                placement="top"
              >
                <div>
                  {{ t("standings.se") }}
                </div>

                <template #popper>
                  <div>
                    "average hardness".
                    <br>
                    Problem, solved by N teams out of M,
                    <br>
                    have hardness (M-N)/M.
                  </div>
                </template>
              </Tooltip>
            </th>
          </tr>
        </thead>
        <tbody>
          <template
            v-if="rankOptions.battleOfGiants.enable"
          >
            <template
              v-for="(giantTeam, ix) in giantTeams"

              :key="`giant-team-${giantTeam.team.id}`"
            >
              <TeamUI
                :ix="ix"
                :rank="rank"
                :team="giantTeam.team"
                :giants-type="giantTeam.giantsType"
              />
            </template>
          </template>

          <template
            v-for="(team, ix) in filterTeams"
            :key="`filter-${team.id}`"
          >
            <TeamUI
              :ix="ix"
              :rank="rank"
              :team="team"
              :is-filter="true"
            />
          </template>

          <template
            v-for="(team, ix) in teams"
            :key="team.id"
          >
            <TeamUI
              :ix="ix"
              :rank="rank"
              :team="team"
            />
          </template>

          <BottomStatistics
            :rank="rank"
          />
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped lang="less">
@import "./Standings.less";
</style>
