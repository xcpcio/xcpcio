<script setup lang="ts">
const dataSourceUrl = useQueryForDataSourceUrl();
</script>

<template>
  <DataSourceInput />

  <div v-if="dataSourceUrl.length > 0">
    <Board
      :data-source-url="dataSourceUrl"
    />
  </div>
</template>
