<script setup lang="ts">
const { t } = useI18n();
const route = useRoute();

const contestTypes = [
  "camp",
  "icpc",
  "ccpc",
  "provincial-contest",
  // TODO: can't use multi <Board /> with vite-ssg
  "board",
];

const isNotFound = !contestTypes.some(c => route.fullPath.startsWith(`/${c}`));

const isBoard = computed(() => {
  return route.fullPath.startsWith("/board");
});
</script>

<template>
  <div
    v-if="isNotFound"
    class="flex flex-col items-center"
  >
    <div text-4xl>
      <div i-carbon-warning />
    </div>
    {{ t('not-found') }}
    <GoBack />
  </div>

  <div v-if="isBoard">
    <CustomBoard />
  </div>

  <div v-else>
    <Board />
  </div>
</template>

<route lang="yaml">
meta:
  layout: board-layout
</route>
