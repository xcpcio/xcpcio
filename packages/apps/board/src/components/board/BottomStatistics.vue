<script setup lang="ts">
import type { ProblemStatistics, Rank } from "@xcpcio/core";

const props = defineProps<{
  rank: Rank,
}>();

const { t } = useI18n();

const rank = computed(() => props.rank);

function getColSpan() {
  let res = 3;

  if (rank.value.contest.organization) {
    res++;
  }

  if (rank.value.contest.badge) {
    res++;
  }

  return res;
}

function getAttemptedRatio(p: ProblemStatistics): string {
  if (p.submittedNum === 0) {
    return "NaN";
  }

  const ratio = Math.floor(p.attemptedNum * 100 / p.submittedNum);
  return `${ratio}%`;
}

function getAcceptedRatio(p: ProblemStatistics): string {
  if (p.submittedNum === 0) {
    return "NaN";
  }

  const ratio = Math.floor(p.acceptedNum * 100 / p.submittedNum);
  return `${ratio}%`;
}

function getDirt(p: ProblemStatistics): string {
  if (p.attemptedNum === 0) {
    return "NaN";
  }

  return `${p.dirt}%`;
}

function getFirstSolved(p: ProblemStatistics): string {
  if (p.firstSolveSubmissions.length === 0) {
    return "Null";
  }

  const t = p.firstSolveSubmissions[0].timestampToMinute;
  return `${t}`;
}

function getLastSolved(p: ProblemStatistics): string {
  if (p.lastSolveSubmissions.length === 0) {
    return "Null";
  }

  const t = p.lastSolveSubmissions[0].timestampToMinute;
  return `${t}`;
}
</script>

<template>
  <tr class="statistics-0">
    <td class="empty" :colspan="getColSpan()" />
    <td class="stnd">
      <b>{{ t("standings.statistics.submitted") }}</b>
    </td>
    <template v-for="p in rank.contest.problems" :key="p.id">
      <td class="stnd">
        <b>{{ p.statistics.submittedNum }}</b>
      </td>
    </template>
  </tr>

  <tr class="statistics-1">
    <td class="empty" :colspan="getColSpan()" />
    <td class="stnd">
      <b>{{ t("standings.statistics.attempted") }}</b>
    </td>
    <template v-for="p in rank.contest.problems" :key="p.id">
      <td class="stnd">
        <b>{{ p.statistics.attemptedNum }}</b>
        <br>
        <b>
          ({{ getAttemptedRatio(p.statistics) }})
        </b>
      </td>
    </template>
  </tr>

  <tr class="statistics-0">
    <td class="empty" :colspan="getColSpan()" />
    <td class="stnd">
      <b>{{ t("standings.statistics.accepted") }}</b>
    </td>
    <template v-for="p in rank.contest.problems" :key="p.id">
      <td class="stnd">
        <b>{{ p.statistics.acceptedNum }}</b>
        <br>
        <b>
          ({{ getAcceptedRatio(p.statistics) }})
        </b>
      </td>
    </template>
  </tr>

  <tr class="statistics-1">
    <td class="empty" :colspan="getColSpan()" />
    <td class="stnd">
      <b>{{ t("standings.statistics.dirt") }}</b>
    </td>
    <template v-for="p in rank.contest.problems" :key="p.id">
      <td class="stnd">
        <b>{{ p.statistics.attemptedNum - p.statistics.acceptedNum }}</b>
        <br>
        <b>
          ({{ getDirt(p.statistics) }})
        </b>
      </td>
    </template>
  </tr>

  <tr class="statistics-0">
    <td class="empty" :colspan="getColSpan()" />
    <td class="stnd">
      <b>{{ t("standings.statistics.first_solved") }}</b>
    </td>
    <template v-for="p in rank.contest.problems" :key="p.id">
      <td class="stnd">
        <b>{{ getFirstSolved(p.statistics) }}</b>
      </td>
    </template>
  </tr>

  <tr class="statistics-1">
    <td class="empty" :colspan="getColSpan()" />
    <td class="stnd">
      <b>{{ t("standings.statistics.last_solved") }}</b>
    </td>
    <template v-for="p in rank.contest.problems" :key="p.id">
      <td class="stnd">
        <b>{{ getLastSolved(p.statistics) }}</b>
      </td>
    </template>
  </tr>
</template>

<style scoped lang="less">
@import "./Standings.less";
</style>
