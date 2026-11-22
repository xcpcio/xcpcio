<script setup lang="ts">
import type { Team, TeamProblemStatistics } from "@xcpcio/core";

const props = defineProps<{
  team: Team;
}>();

const { t } = useI18n();

const team = computed(() => props.team);

const solvedProblemCount = computed(() => {
  return team.value.problemStatistics.filter(p => p.isSolved).length;
});

const wrongAttemptCount = computed(() => {
  return team.value.problemStatistics.reduce((sum, p) => sum + p.failedCount, 0);
});

const pendingProblemCount = computed(() => {
  return team.value.problemStatistics.reduce((sum, p) => sum + p.pendingCount, 0);
});

function getStatusText(p: TeamProblemStatistics) {
  if (p.isSolved) {
    return t("team_statistics.status.accepted");
  }

  if (p.isPending) {
    return t("team_statistics.status.pending");
  }

  if (p.isWrongAnswer) {
    return t("team_statistics.status.wrong_answer");
  }

  return t("team_statistics.status.not_submitted");
}

function getStatusClass(p: TeamProblemStatistics) {
  if (p.isSolved) {
    return "text-green-600 dark:text-green-400";
  }

  if (p.isPending) {
    return "text-amber-600 dark:text-amber-400";
  }

  if (p.isWrongAnswer) {
    return "text-red-600 dark:text-red-400";
  }

  return "text-gray-400 dark:text-gray-500";
}

function getProblemStyle(p: TeamProblemStatistics) {
  return {
    backgroundColor: p.problem.balloonColor.background_color,
    color: p.problem.balloonColor.color,
  };
}
</script>

<template>
  <section class="w-full text-left font-sans">
    <div class="mb-2 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
      <h3 class="text-sm font-semibold text-gray-900 dark:text-white">
        {{ t("team_statistics.title") }}
      </h3>

      <div class="flex flex-wrap items-center gap-x-3 text-[11px] font-semibold">
        <span class="text-green-600 dark:text-green-400">
          {{ t("team_statistics.solved_summary") }} {{ solvedProblemCount }}
        </span>
        <span :class="wrongAttemptCount > 0 ? 'text-red-500 dark:text-red-400' : 'text-gray-400 dark:text-gray-500'">
          {{ t("team_statistics.wrong_summary") }} {{ wrongAttemptCount }}
        </span>
        <span v-if="pendingProblemCount > 0" class="text-amber-600 dark:text-amber-400">
          {{ t("team_statistics.pending_summary") }} {{ pendingProblemCount }}
        </span>
      </div>
    </div>

    <div class="grid grid-cols-1 gap-2 min-[360px]:grid-cols-2">
      <div
        v-for="p in team.problemStatistics"
        :key="p.problem.id"
        class="rounded-md border border-gray-200 p-2 dark:border-gray-700"
      >
        <div class="flex items-center gap-2">
          <span
            class="flex h-8 w-8 shrink-0 items-center justify-center rounded text-sm font-bold"
            :style="getProblemStyle(p)"
          >
            {{ p.problem.label }}
          </span>

          <div class="min-w-0 flex-1">
            <div class="flex items-center justify-between gap-1">
              <span
                class="truncate text-xs font-semibold"
                :class="getStatusClass(p)"
              >
                {{ getStatusText(p) }}
              </span>

              <span
                v-if="p.isSolved"
                class="shrink-0 font-mono text-[10px] text-gray-400 dark:text-gray-500"
              >
                {{ p.solvedTimestampToMinute }}'
              </span>
            </div>

            <div
              v-if="p.totalCount > 0"
              class="mt-0.5 flex flex-wrap items-center gap-x-1 text-[10px] text-gray-500 dark:text-gray-400"
            >
              <span>{{ t("team_statistics.attempts", { count: p.totalCount }) }}</span>
              <span class="opacity-40">·</span>
              <span :class="p.failedCount > 0 ? 'font-semibold text-red-500 dark:text-red-400' : ''">
                {{ t("team_statistics.wrong_count", { count: p.failedCount }) }}
              </span>
            </div>

            <div
              v-else
              class="mt-0.5 text-[11px] text-gray-400 dark:text-gray-500"
            >
              {{ t("team_statistics.no_attempts") }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
</template>
