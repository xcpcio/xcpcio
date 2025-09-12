<script setup lang="ts">
import { getDataSourceUrl } from "@board/composables/query";

const dataSourceUrl = getDataSourceUrl();
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
    <Balloon
      :data-source-url="dataSourceUrl"
    />
  </div>
</template>
