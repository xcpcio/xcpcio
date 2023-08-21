<script setup lang="ts">
import { ContestState } from "@xcpcio/types";

const props = defineProps<{
  width: number,
  state: ContestState,
}>();

const barClass = computed(() => {
  switch (props.state) {
    case ContestState.PENDING:
      return "am-progress-bar-secondary";
    case ContestState.RUNNING:
      return "am-progress-bar-success";
    case ContestState.FROZEN:
      return "am-progress-bar-danger";
    case ContestState.FINISHED:
      return "am-progress-bar-primary";
  }
});
</script>

<template>
  <div
    class="am-progress am-progress-striped am-active w-full"
  >
    <div
      class="am-progress-bar"
      :class="barClass"
      :style="{ width: `${props.width}%` }"
    />
  </div>
</template>

<style scoped lang="less">
@import "./Progress.less";
</style>
