<script setup lang="ts">
import type { Rank } from "@xcpcio/core";

import { Chart } from "highcharts-vue";

const props = defineProps<{
  rank: Rank;
}>();

const { t } = useI18n();

const rank = computed(() => props.rank);

const headData = computed(() => {
  const res = [];

  res.push({
    title: "standings.statistics.head_data.problems",
    data: rank.value.contest.problems.length,
  });

  if (rank.value.organizations.length > 0) {
    res.push({
      title: "standings.statistics.head_data.organizations",
      data: rank.value.organizations.length,
    });
  }

  res.push({
    title: "standings.statistics.head_data.teams",
    data: rank.value.teams.length,
  });

  res.push({
    title: "standings.statistics.head_data.submissions",
    data: rank.value.getSubmissions().length,
  });

  return res;
});
</script>

<template>
  <div
    class="w-full"
    flex flex-col
  >
    <section>
      <div
        class="sm:w-full md:w-[92%]"
        mx-auto px-4 py-4 lg:px-6 lg:py-6
      >
        <div
          grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-6 xl:grid-cols-4 xl:gap-20
          place-items-center
        >
          <div v-for="h in headData" :key="h.title" class="w-full max-w-[16rem]">
            <div
              w-full
              p-4 sm:p-6 xl:p-8
              flex flex-col
              border border-gray-100 dark:border-gray-600
              text-center test-gray-900
              bg-white dark:bg-gray-800
              dark:text-white
              shadow rounded-md
            >
              <h3
                mb-2 text-xl font-semibold sm:mb-4 sm:text-2xl
              >
                {{ t(h.title) }}
              </h3>
              <div class="my-4 flex items-baseline justify-center sm:my-8">
                <span class="text-4xl font-extrabold sm:text-5xl">{{ h.data }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <div
      mt-8 gap-8
      flex flex-col
    >
      <div>
        <SubmitHeatMap
          :rank="rank"
        />
      </div>

      <div>
        <Chart
          :options="getSubmitChart(rank)"
        />
      </div>

      <div>
        <Chart
          :options="getProblemChart(rank)"
        />
      </div>

      <div>
        <Chart
          :options="getTeamChart(rank)"
        />
      </div>
    </div>
  </div>
</template>
