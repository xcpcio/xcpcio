<script setup lang="ts">
import { getDataSourceUrl } from "~/composables/query";

const dataSourceUrl = getDataSourceUrl();
</script>

<template>
  <DataSourceInput />

  <div v-if="dataSourceUrl.length > 0">
    <Board
      :data-source-url="dataSourceUrl"
    />
  </div>
</template>
