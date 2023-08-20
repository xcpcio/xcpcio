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
    data: rank.submissions.length,
  });

  return l;
}
</script>

<template>
  <div
    class="flex flex-col w-88vw md:w-92vw"
  >
    <section>
      <div class="mx-auto px-4 max-w-screen-xl lg:px-6 py-4 lg:py-6">
        <div class="lg:space-y-0 space-y-8 lg:grid lg:grid-cols-3 sm:gap-6 xl:gap-10">
          <div v-for="h in getHeadData()" :key="h.title">
            <div class="flex flex-col mx-auto text-center text-gray-900 dark:text-white bg-white rounded-lg border dark:border-gray-600 dark:bg-gray-800 p-6 border-gray-100 shadow xl:p-8 max-w-[16rem]">
              <h3 class="text-2xl font-semibold mb-4">
                {{ t(h.title) }}
              </h3>
              <div class="flex justify-center items-baseline my-8">
                <span class="mr-2 text-5xl font-extrabold">{{ h.data }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <div class="flex flex-col mt-8 gap-8">
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
