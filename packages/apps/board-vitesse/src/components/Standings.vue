<script setup lang="ts">
import type { Team, TeamProblemStatistics } from "@xcpcio/core";
import { Rank } from "@xcpcio/core";

const props = defineProps({
  rank: {
    type: Rank,
    required: true,
  },
});

const { t } = useI18n();

const rank = reactive(props.rank);

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

  return ".";
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
    return "firstsolve";
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
  <div class="mt-5">
    <div>
      <table class="standings font-mono">
        <thead>
          <tr>
            <th class="title" style="width: 3em;">
              {{ t("standings.place") }}
            </th>
            <th v-if="rank.contest.organization" class="title" style="min-width: 12em;">
              {{ rank.contest.organization }}
            </th>
            <th class="title" style="min-width: 12em;">
              {{ t("standings.team") }}
            </th>
            <th class="title" style="width: 3em;">
              {{ t("standings.solved") }}
            </th>
            <th class="title" style="width: 3em;">
              {{ t("standings.penalty") }}
            </th>
            <th
              v-for="p in rank.contest.problems"
              :key="p.id"
              class="success"
              style="width: 4em;"
              :style="{
                'background-color': p.balloonColor?.background_color,
                'color': p.balloonColor?.color,
              }"
            >
              {{ p.label }}
              <br>
              <s>{{ p.statistics.acceptedNum }}</s>
            </th>
            <th class="title">
              {{ t("standings.dict") }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="team in rank.teams"
            :key="team.id"
            class="team"
            :class="[`stand${team.solvedProblemNum % 2}${(team.rank - 1) % 2}`]"
          >
            <td class="stnd">
              {{ team.rank }}
            </td>
            <td v-if="rank.contest.organization" class="stnd">
              {{ team.organization }}
            </td>
            <td class="stnd">
              {{ team.name }}
            </td>
            <td class="stnd">
              {{ team.solvedProblemNum }}
            </td>
            <td class="stnd">
              {{ team.penaltyToMinute() }}
            </td>
            <td
              v-for="p in team.problemStatistics"
              :key="p.problem.id"
              class="stnd"
              :class="[getProblemColorClass(p)]"
            >
              {{ getProblemSign(p) }}
              <br>
              {{ getProblemShow(p) }}
            </td>
            <td class="stnd">
              {{ getTeamDict(team) }}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped lang="less">
@import "./Standings.less";
</style>
