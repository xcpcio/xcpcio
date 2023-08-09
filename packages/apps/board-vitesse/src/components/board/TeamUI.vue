<script setup lang="ts">
import type { Rank, Team, TeamProblemStatistics } from "@xcpcio/core";

const props = defineProps<{
  rank: Rank,
  team: Team,
}>();

const rank = reactive(props.rank);
const team = reactive(props.team);

function getStandClassName(t: Team): string {
  return `stand${t.solvedProblemNum % 2}${(t.rank - 1) % 2}`;
}

function getProblemSign(p: TeamProblemStatistics): string {
  if (p.isSolved) {
    return "+";
  }

  if (p.isWrongAnswer) {
    return "-";
  }

  if (p.isPending) {
    return `? ${p.pendingCount}`;
  }

  return "";
}

function getProblemShow(p: TeamProblemStatistics): string {
  let res = "";

  if (!p.isUnSubmitted) {
    res += `${p.failedCount + Number(p.isSolved)}`;
  }

  if ((p.isSolved && rank.contest.statusTimeDisplay.correct)
                || (p.isPending && rank.contest.statusTimeDisplay.pending)
                || (p.isWrongAnswer && rank.contest.statusTimeDisplay.incorrect)) {
    res += `/${Math.floor(p.lastSubmitTimestamp / 60)}`;
  }

  return res;
}

function getProblemColorClass(p: TeamProblemStatistics): string {
  if (p.isFirstSolved) {
    return "first-solve";
  }

  if (p.isSolved) {
    return "correct";
  }

  if (p.isWrongAnswer) {
    return "incorrect";
  }

  if (p.isPending) {
    return "pending";
  }

  return "unattempted";
}
</script>

<template>
  <tr class="h-10">
    <td
      class="stnd"
      :class="[getStandClassName(team)]"
    >
      {{ team.rank }}
    </td>
    <td
      v-if="rank.contest.badge"
      class="empty"
    >
      <img
        :src="['data:image/png;base64,', team.badge?.base64].join('')"
        alt=""
        class="w-8 h-8"
      >
    </td>
    <td
      v-if="rank.contest.organization"
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
      class="stnd"
      :class="[getStandClassName(team)]"
    >
      <span>{{ team.name }}</span>
      <StarIcon v-if="team.group.includes('unofficial')" inline-block />
      <GirlIcon v-if="team.group.includes('girl')" inline-block />
    </td>
    <td
      class="stnd"
      :class="[getStandClassName(team)]"
    >
      {{ team.solvedProblemNum }}
    </td>
    <td
      class="stnd"
      :class="[getStandClassName(team)]"
    >
      {{ team.penaltyToMinute }}
    </td>

    <template
      v-for="p in team.problemStatistics"
      :key="p.problem.id"
    >
      <td
        class="stnd"
        :class="[getProblemColorClass(p)]"
      >
        {{ getProblemSign(p) }}
        <br>
        {{ getProblemShow(p) }}
      </td>
    </template>
    <td
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
