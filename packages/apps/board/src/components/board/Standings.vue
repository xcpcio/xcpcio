<script setup lang="ts">
import type { Rank } from "@xcpcio/core";

const props = defineProps<{
  rank: Rank,
}>();

const { t } = useI18n();

const rank = computed(() => props.rank);
const teams = computed(() => props.rank.teams);

const filterTeams = computed(() => {
  const res = props.rank.teams.filter((t) => {
    if (props.rank.organizations) {
      if (props.rank.options.filterOrganizationMap.has(t.organization)) {
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

const maxOrgLength = computed(() => {
  let res = 0;
  rank.value.teams.forEach((t) => {
    res = Math.max(res, t.organization.length);
  });

  return res;
});

const maxTeamLength = computed(() => {
  let res = 0;
  rank.value.teams.forEach((t) => {
    res = Math.max(res, t.name.length);
  });

  return res;
});
</script>

<template>
  <div>
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
              style="width: 2rem;"
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
              {{ t("standings.dirt") }}
            </th>
          </tr>
        </thead>
        <tbody>
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
