<script setup lang="ts">
import { Chart } from "highcharts-vue";

import type { Rank } from "@xcpcio/core";

const props = defineProps<{
  rank: Rank,
}>();

const { t } = useI18n();

const rank = reactive(props.rank);

function getHeadData() {
  const l = [];

  l.push({
    title: "standings.statistics.head_data.problems",
    data: rank.contest.problems.length,
  });

  l.push({
    title: "standings.statistics.head_data.teams",
    data: rank.teams.length,
  });

  l.push({
    title: "standings.statistics.head_data.submissions",
    data: rank.getSubmissions().length,
  });

  return l;
}
</script>

<template>
  <div
    class="w-88vw flex flex-col md:w-92vw"
  >
    <section>
      <div class="mx-auto max-w-screen-xl px-4 py-4 lg:px-6 lg:py-6">
        <div class="lg:grid lg:grid-cols-3 sm:gap-6 xl:gap-10 space-y-8 lg:space-y-0">
          <div v-for="h in getHeadData()" :key="h.title">
            <div class="mx-auto max-w-[16rem] flex flex-col border border-gray-100 rounded-lg bg-white p-6 text-center text-gray-900 shadow dark:border-gray-600 dark:bg-gray-800 xl:p-8 dark:text-white">
              <h3 class="mb-4 text-2xl font-semibold">
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

    <div class="mt-8 flex flex-col gap-8">
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
