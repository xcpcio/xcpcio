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
    class="flex flex-col w-88vw md:w-92vw"
  >
    <section>
      <div class="mx-auto max-w-screen-xl px-4 py-4 lg:px-6 lg:py-6">
        <div class="lg:grid lg:grid-cols-3 sm:gap-6 xl:gap-10 space-y-8 lg:space-y-0">
          <div v-for="h in getHeadData()" :key="h.title">
            <div class="mx-auto flex flex-col text-center text-gray-900 dark:text-white max-w-[16rem] border border-gray-100 rounded-lg bg-white p-6 shadow dark:border-gray-600 dark:bg-gray-800 xl:p-8">
              <h3 class="text-2xl font-semibold mb-4">
                {{ t(h.title) }}
              </h3>
              <div class="flex justify-center my-8 items-baseline">
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
