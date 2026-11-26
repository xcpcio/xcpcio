<script setup lang="ts">
import { useIsContestIndexPage } from "@board/composables/indexPage";
import { isQueryRoutingMode } from "@board/composables/routing";
import { getRuntimeConfig } from "@board/composables/runtimeConfig";

const { t } = useI18n();
const route = useRoute();
const runtimeConfig = getRuntimeConfig();
const isContestIndexPage = useIsContestIndexPage();
const isQueryRouting = isQueryRoutingMode();

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
  <div v-else-if="isQueryRouting" class="flex flex-col items-center">
    <div text-4xl>
      <div i-carbon-warning />
    </div>
    {{ t("not-found") }}
    <GoBack />
  </div>
  <div v-else>
    <Board allow-index-fallback />
  </div>
</template>

<route lang="yaml">
meta:
  layout: board-layout
</route>
