<script setup lang="ts">
import type { ContestState } from "@xcpcio/types";

const props = defineProps<{
  state: ContestState,
}>();
</script>

<template>
  <div class="flex flex-row items-center justify-center">
    <div
      class="label"
      :class="props.state"
    />
    <div>
      {{ props.state }}
    </div>
  </div>
</template>

<style scoped lang="less">
@import "./Progress.less";
</style>
