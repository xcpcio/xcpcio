<script setup lang="ts">
const { t } = useI18n();
</script>

<template>
  <div>
    <div text-4xl>
      <div inline-block i-carbon-warning />
    </div>
    {{ t('not-found') }}
    <GoBack />
  </div>
</template>
