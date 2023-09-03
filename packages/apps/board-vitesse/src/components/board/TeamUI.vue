<script setup lang="ts">
import type { Rank, Team } from "@xcpcio/core";

const props = defineProps<{
  rank: Rank,
  team: Team,
}>();

const el = ref(null);
const isVisible = useElementVisibility(el);

const rank = reactive(props.rank);
const team = reactive(props.team);

function getStandClassName(t: Team): string {
  return `stand${t.solvedProblemNum % 2}${(t.rank - 1) % 2}`;
}

function isRenderByVisible() {
  // Some teams in the header may have rendering anomalies,
  // so force the first 32 teams to render regardless of their visibility
  // when rank rebuild trigger by drag the progress bar
  return isVisible.value || team.rank < 32;
}
</script>

<template>
  <tr
    ref="el"
    class="h-10"
  >
    <td
      v-if="isRenderByVisible()"
      class="stnd"
      :class="[getStandClassName(team)]"
    >
      {{ team.rank }}
    </td>
    <td
      v-if="rank.contest.badge && isRenderByVisible()"
      class="empty flex items-center justify-center"
    >
      <img
        :src="['data:image/png;base64,', team.badge?.base64].join('')"
        alt=""
        class="h-8 w-8"
      >
    </td>
    <td
      v-if="rank.contest.organization && isRenderByVisible()"
      class="stnd"
      :class="[getStandClassName(team)]"
    >
      <div flex>
        <div class="float-left pl-2 font-serif">
          <div v-if="team.organizationRank > -1">
            {{ team.organizationRank }}
          </div>
        </div>
        <div class="flex-1">
          {{ team.organization }}
        </div>
        <div class="float-right" />
      </div>
    </td>
    <td
      v-if="isRenderByVisible()"
      class="stnd"
      :class="[getStandClassName(team)]"
    >
      <span>{{ team.name }}</span>
      <StarIcon v-if="team.group.includes('unofficial')" inline-block />
      <GirlIcon v-if="team.group.includes('girl')" inline-block />
    </td>
    <td
      v-if="isRenderByVisible()"
      class="stnd"
      :class="[getStandClassName(team)]"
    >
      {{ team.solvedProblemNum }}
    </td>
    <td
      v-if="isRenderByVisible()"
      class="stnd"
      :class="[getStandClassName(team)]"
    >
      {{ team.penaltyToMinute }}
    </td>

    <template
      v-for="p in team.problemStatistics"
      :key="p.problem.id"
    >
      <TeamProblemBlock
        v-if="isRenderByVisible()"
        :rank="rank"
        :team="team"
        :p="p"
      />
    </template>
    <td
      v-if="isRenderByVisible()"
      class="stnd"
      :class="[getStandClassName(team)]"
    >
      {{ `${team.dict}%` }}
    </td>
  </tr>
</template>

<style scoped lang="less">
@import "./Standings.less";
</style>
