<script setup lang="ts">
import type { Problem, Rank } from "@xcpcio/core";

import SubmissionCharts from "@board/components/board/SubmissionCharts.vue";
import { getTimeDiff, isAccepted } from "@xcpcio/core";

const props = defineProps<{
  rank: Rank;
  problem: Problem;
}>();

const { t } = useI18n();

const submissions = computed(() =>
  props.rank.getSubmissions().filter(s => s.problemId === props.problem.id),
);
const acceptedSubmissions = computed(() => submissions.value.filter(s => isAccepted(s.status)));
const statistics = computed(() => props.problem.statistics);
const durationMinutes = computed(() =>
  props.rank.contest.getEndTime().diff(props.rank.contest.getStartTime(), "minute"),
);

const acceptanceRate = computed(() => {
  if (submissions.value.length === 0) {
    return "—";
  }
  return `${((acceptedSubmissions.value.length / submissions.value.length) * 100).toFixed(1)}%`;
});

const firstSolveTime = computed(() => {
  const first = statistics.value.firstSolveSubmissions[0];
  return first ? getTimeDiff(first.timestampToMinute) : "—";
});
</script>

<template>
  <div
    class="w-full px-4 pb-6 font-sans font-normal lg:px-12"
    flex flex-col gap-6
  >
    <div
      grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4
    >
      <div
        class="rounded-md border border-gray-100 p-4 text-center dark:border-gray-600 dark:bg-gray-800"
      >
        <div class="text-sm text-gray-500 dark:text-gray-400">
          {{ t("problem_statistics.accepted_teams") }}
        </div>
        <div class="mt-2 text-3xl font-extrabold text-gray-900 dark:text-white">
          {{ statistics.acceptedNum }}
        </div>
      </div>

      <div
        class="rounded-md border border-gray-100 p-4 text-center dark:border-gray-600 dark:bg-gray-800"
      >
        <div class="text-sm text-gray-500 dark:text-gray-400">
          {{ t("submission_statistics.submissions") }}
        </div>
        <div class="mt-2 text-3xl font-extrabold text-gray-900 dark:text-white">
          {{ submissions.length }}
        </div>
      </div>

      <div
        class="rounded-md border border-gray-100 p-4 text-center dark:border-gray-600 dark:bg-gray-800"
      >
        <div class="text-sm text-gray-500 dark:text-gray-400">
          {{ t("problem_statistics.acceptance_rate") }}
        </div>
        <div class="mt-2 text-3xl font-extrabold text-gray-900 dark:text-white">
          {{ acceptanceRate }}
        </div>
      </div>

      <div
        class="rounded-md border border-gray-100 p-4 text-center dark:border-gray-600 dark:bg-gray-800"
      >
        <div class="text-sm text-gray-500 dark:text-gray-400">
          {{ t("problem_statistics.first_solve") }}
        </div>
        <div class="mt-2 text-3xl font-extrabold text-gray-900 dark:text-white">
          {{ firstSolveTime }}
        </div>
      </div>
    </div>

    <SubmissionCharts
      :submissions="submissions"
      :duration-minutes="durationMinutes"
    />
  </div>
</template>
