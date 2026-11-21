<script setup lang="ts">
import type { Rank } from "@xcpcio/core";
import type { Lang } from "@xcpcio/types";
import { useStandingsLists } from "@board/composables/useStandingsLists";

const props = defineProps<{
  rank: Rank;
}>();

const { t, locale } = useI18n();
const lang = computed(() => locale.value as unknown as Lang);
// Below 1280px the Organization column is merged into the Team cell to keep the
// standings compact. Phones render the mobile card list instead, so this only
// affects narrow desktop windows and tablets at 1024px and above.
const isCompactLayout = useMediaQuery("(max-width: 1279.98px)");

const rank = computed(() => props.rank);
const { teams, filterTeams, giantTeams, rankOptions } = useStandingsLists(rank);

// The org cell reserves `pl-10` (2.5rem) for the logo and `pl-2` (0.5rem) for
// the org rank. Only the name length was used to size the column, so names were
// wrapped as soon as a logo was rendered next to them.
const ORGANIZATION_LOGO_WIDTH_REM = 2.5;

const maxOrgWidth = computed(() => {
  let res = 0;
  rank.value.teams.forEach((t) => {
    if (t.organization) {
      const nameLength = t.organization.name.getOrDefault(lang.value).length;
      const logoWidth = t.organization.logo ? ORGANIZATION_LOGO_WIDTH_REM : 0;

      res = Math.max(res, Math.ceil(nameLength * 1.1 + logoWidth));
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
        font-mono dark:text-gray-200
      >
        <thead
          class="sticky top-0 z-99"
        >
          <tr>
            <th
              class="title place-column"
              style="width: 3rem;"
            >
              {{ t("standings.place") }}
            </th>
            <th
              v-if="rank.contest.options.enableOrganization && !isCompactLayout"
              class="title"
              :style="{ width: `${Math.min(32, maxOrgWidth)}rem` }"
            >
              {{ t("standings.organization") }}
            </th>
            <th
              class="title team-column"
              :style="{ width: `${Math.min(32, Math.ceil(maxTeamLength * 1))}rem` }"
            >
              {{ t("standings.team") }}
            </th>
            <th
              class="title solved-column"
              style="width: 3rem;"
            >
              {{ t("standings.solved") }}
            </th>
            <th
              class="title penalty-column"
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

            <th class="title dirt-column" style="width: 2.5rem;">
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

            <th class="title se-column" style="width: 2.5rem;">
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
                :is-compact-layout="isCompactLayout"
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
              :is-compact-layout="isCompactLayout"
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
              :is-compact-layout="isCompactLayout"
            />
          </template>

          <BottomStatistics
            :rank="rank"
            :is-compact-layout="isCompactLayout"
          />
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped lang="less">
@import "./Standings.less";
</style>
