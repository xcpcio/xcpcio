<script setup lang="ts">
import type { Rank } from "@xcpcio/core";
import type { Lang } from "@xcpcio/types";

const props = defineProps<{
  rank: Rank;
  organizationId: string;
}>();

const { t, locale } = useI18n();
const lang = computed(() => locale.value as unknown as Lang);

const rank = computed(() => props.rank);

const teams = computed(() => {
  return props.rank.teams
    .filter(t => t.organizationId === props.organizationId)
    .sort((a, b) => a.rank - b.rank);
});

const maxTeamLength = computed(() => {
  let res = 0;
  teams.value.forEach((t) => {
    res = Math.max(res, t.name.getOrDefault(lang.value).length);
  });

  return res;
});
</script>

<template>
  <div flex justify-center>
    <table
      class="standings"
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
          v-for="(team, ix) in teams"
          :key="team.id"
        >
          <TeamUI
            :ix="ix"
            :rank="rank"
            :team="team"
            :hide-organization="true"
          />
        </template>
      </tbody>
    </table>
  </div>
</template>

<style scoped lang="less">
@import "./Standings.less";
</style>
