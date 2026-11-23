<script setup lang="ts">
import type { Rank, Team } from "@xcpcio/core";
import { Chart } from "highcharts-vue";

const props = defineProps<{
  rank: Rank;
  team: Team;
}>();
</script>

<template>
  <Chart :options="getTeamPlaceChart(props.rank, props.team)" />
</template>
