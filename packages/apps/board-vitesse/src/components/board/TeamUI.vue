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

function getTeamDict(t: Team): string {
  let failedCount = 0;
  let solved = 0;

  t.problemStatistics.forEach((p) => {
    if (p.isSolved) {
      failedCount += p.failedCount;
      solved++;
    }
  });

  let dict = 0;

  if (solved > 0) {
    dict = Math.floor((failedCount / (failedCount + solved)) * 100);
  }

  return `${dict}%`;
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
      v-if="rank.contest.organization"
      class="stnd"
      :class="[getStandClassName(team)]"
    >
      {{ team.organization }}
    </td>
    <td
      class="stnd"
      :class="[getStandClassName(team)]"
    >
      {{ team.name }}
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
      {{ team.penaltyToMinute() }}
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
      {{ getTeamDict(team) }}
    </td>
  </tr>
</template>

<style scoped lang="less">
  @import "./Standings.less";
</style>
