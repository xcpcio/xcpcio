<script setup lang="ts">
const dataSourceUrl = useQueryForDataSourceUrl();
</script>

<template>
  <div
    v-if="dataSourceUrl.length === 0"
  >
    <div
      mt-20
    >
      <DataSourceInput />
    </div>
  </div>

  <div
    v-if="dataSourceUrl.length > 0"
  >
    <Countdown
      :data-source-url="dataSourceUrl"
    />
  </div>
</template>
