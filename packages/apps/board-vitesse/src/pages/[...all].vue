<script setup lang="ts">
const { t } = useI18n();
</script>

<template>
  <div class="flex flex-col items-center">
    <div text-4xl>
      <div inline-block i-carbon-warning />
    </div>
    {{ t('not-found') }}
    <GoBack />
  </div>
</template>
