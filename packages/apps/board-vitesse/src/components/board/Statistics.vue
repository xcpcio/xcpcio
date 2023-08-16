<script setup lang="ts">
import { Chart } from "highcharts-vue";

import type { Rank } from "@xcpcio/core";

const props = defineProps<{
  rank: Rank,
}>();

const rank = reactive(props.rank);
</script>

<template>
  <div class="flex flex-col w-full mt-8 gap-8">
    <div>
      <Chart :options="getSubmitChart(rank)" />
    </div>

    <div>
      <Chart :options="getProblemChart(rank)" />
    </div>

    <div>
      <Chart :options="getTeamChart(rank)" />
    </div>
  </div>
</template>
