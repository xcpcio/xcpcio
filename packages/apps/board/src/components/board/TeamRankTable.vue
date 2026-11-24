<script setup lang="ts">
import type { Rank, Team } from "@xcpcio/core";
import type { Lang } from "@xcpcio/types";

const props = defineProps<{
  rank: Rank;
  team: Team;
}>();

const { t, locale } = useI18n();
const lang = computed(() => locale.value as unknown as Lang);

const rank = computed(() => props.rank);
const team = computed(() => props.team);

const showOrganization = computed(() => rank.value.contest.options.enableOrganization);

// Match the organization column width calculation used by the main table.
const ORGANIZATION_LOGO_WIDTH_REM = 2.5;

const organizationWidth = computed(() => {
  const nameLength = team.value.organization?.name.getOrDefault(lang.value).length ?? 0;
  const logoWidth = team.value.organization?.logo ? ORGANIZATION_LOGO_WIDTH_REM : 0;

  return Math.min(32, Math.ceil(nameLength * 1.1 + logoWidth));
});

const teamNameLength = computed(() => {
  return team.value.name.getOrDefault(lang.value).length;
});
</script>

<template>
  <div class="w-full overflow-x-auto">
    <table
      class="standings w-max"
      font-mono dark:text-gray-200
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
            v-if="showOrganization"
            class="title"
            :style="{ width: `${organizationWidth}rem` }"
          >
            {{ t("standings.organization") }}
          </th>
          <th
            class="title"
            :style="{ width: `${Math.min(32, Math.ceil(teamNameLength * 1))}rem` }"
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
                <div class="text-center">
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
                <div class="text-center">
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
        <TeamUI
          :ix="0"
          :rank="rank"
          :team="team"
          readonly
        />
      </tbody>
    </table>
  </div>
</template>

<style scoped lang="less">
@import "./Standings.less";

// Center the table when it fits the modal. Keep it left-aligned when it is
// wider so the horizontal scroll can reach every column.
table.standings {
  margin-left: auto;
  margin-right: auto;
}
</style>
