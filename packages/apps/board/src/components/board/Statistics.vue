<script setup lang="ts">
import type { Rank } from "@xcpcio/core";

import { Chart } from "highcharts-vue";

const props = defineProps<{
  rank: Rank;
}>();

const { t } = useI18n();

const rank = computed(() => props.rank);

function getHeadData() {
  const l = [];

  l.push({
    title: "standings.statistics.head_data.problems",
    data: rank.value.contest.problems.length,
  });

  l.push({
    title: "standings.statistics.head_data.teams",
    data: rank.value.teams.length,
  });

  l.push({
    title: "standings.statistics.head_data.submissions",
    data: rank.value.getSubmissions().length,
  });

  return l;
}
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
          grid grid-cols-3
          gap-10 space-y-0
        >
          <div v-for="h in getHeadData()" :key="h.title">
            <div
              class="mx-auto w-[16rem]"
              p-6 xl:p-8
              flex flex-col
              border border-gray-100 dark:border-gray-600
              text-center test-gray-900
              bg-white dark:bg-gray-800
              dark:text-white
              shadow rounded-md
            >
              <h3
                mb-4 text-2xl font-semibold
              >
                {{ t(h.title) }}
              </h3>
              <div class="my-8 flex items-baseline justify-center">
                <span class="mr-2 text-5xl font-extrabold">{{ h.data }}</span>
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
