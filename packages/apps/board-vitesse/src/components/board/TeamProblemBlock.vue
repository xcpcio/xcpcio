<script setup lang="ts">
import type { Rank, Team, TeamProblemStatistics } from "@xcpcio/core";

const props = defineProps<{
  rank: Rank,
  team: Team,
  p: TeamProblemStatistics,
}>();

const rank = computed(() => props.rank);
const team = computed(() => props.team);
const p = computed(() => props.p);

const hiddenModel = ref(true);

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

  if ((p.isSolved && rank.value.contest.statusTimeDisplay.correct)
                || (p.isPending && rank.value.contest.statusTimeDisplay.pending)
                || (p.isWrongAnswer && rank.value.contest.statusTimeDisplay.incorrect)) {
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

function onClick() {
  hiddenModel.value = false;
}
</script>

<template>
  <td
    class="stnd"
    :class="[getProblemColorClass(p)]"
  >
    <div
      class="cursor-pointer"
      @click="onClick"
    >
      {{ getProblemSign(p) }}
      <br>
      {{ getProblemShow(p) }}
    </div>

    <div>
      <SubmissionsTableModel
        v-if="!hiddenModel"
        v-model:hidden="hiddenModel"
        :rank="rank"
        :team="team"
        :p="p"
      />
    </div>
  </td>
</template>

<style scoped lang="less">
@import "./Standings.less";
</style>
