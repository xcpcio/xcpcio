<script setup lang="ts">
import { useIsContestIndexPage } from "@board/composables/indexPage";
import { getRuntimeConfig } from "@board/composables/runtimeConfig";

const route = useRoute();
const runtimeConfig = getRuntimeConfig();
const isContestIndexPage = useIsContestIndexPage();

const queryComponent = useQueryForComponent();
const component = computed(() => runtimeConfig.component ?? queryComponent.value);
const dataSource = runtimeConfig.dataSource;
</script>

<template>
  <div v-if="dataSource">
    <Board v-if="component === 'board'" :data-source-url="dataSource" />
    <Resolver v-else-if="component === 'resolver'" :data-source-url="dataSource" />
    <Balloon v-else-if="component === 'balloon'" :data-source-url="dataSource" />
    <Countdown v-else-if="component === 'countdown'" :data-source-url="dataSource" />
  </div>
  <ContestIndexView
    v-else-if="isContestIndexPage"
    :path-prefix="route.path"
  />
  <div v-else>
    <Board allow-index-fallback />
  </div>
</template>

<route lang="yaml">
meta:
  layout: board-layout
</route>
