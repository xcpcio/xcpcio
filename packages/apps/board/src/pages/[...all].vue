<script setup lang="ts">
const { t } = useI18n();
const route = useRoute();

const contestTypes = [
  "camp",
  "icpc",
  "ccpc",
  "provincial-contest",
];

const isNotFound = !contestTypes.some(c => route.fullPath.startsWith(`/${c}`));
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
  <div v-else>
    <Board />
  </div>
</template>

<route lang="yaml">
meta:
  layout: board-layout
</route>
