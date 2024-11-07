<script setup lang="ts">
import { useRouteQuery } from "@vueuse/router";

const { t } = useI18n();
const route = useRoute();

const contestTypes = [
  "camp",
  "icpc",
  "ccpc",
  "provincial-contest",
];

const isNotFound = !contestTypes.some(c => route.fullPath.startsWith(`/${c}`));
const component = useRouteQuery(
  "component",
  "board",
  { transform: String },
);
const dataSource = window.DATA_SOURCE;
</script>

<template>
  <div v-if="dataSource">
    <Board v-if="component === 'board'" :data-source-url="dataSource" />
    <Resolver v-else-if="component === 'resolver'" :data-source-url="dataSource" />
    <Balloon v-else-if="component === 'balloon'" :data-source-url="dataSource" />
    <Countdown v-else-if="component === 'countdown'" :data-source-url="dataSource" />
  </div>
  <div v-else-if="isNotFound" class="flex flex-col items-center">
    <div text-4xl>
      <div i-carbon-warning />
    </div>
    {{ t('not-found') }}
    <GoBack />
  </div>

  <div v-else>
    <Board />
  </div>
</template>

<route lang="yaml">
meta:
  layout: board-layout
</route>
