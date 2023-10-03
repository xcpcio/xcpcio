<script setup lang="ts">
import { ContestState } from "@xcpcio/types";

const props = defineProps<{
  state: ContestState,
  pendingTime?: string,
  pausedTime?: string,
}>();
</script>

<template>
  <div
    flex flex-row items-center justify-center
  >
    <div
      class="label"
      :class="props.state"
    />
    <div>
      {{ props.state }}
    </div>

    <div
      v-if="props.pendingTime && props.state === ContestState.PENDING"
      ml-2
    >
      {{ props.pendingTime }}
    </div>

    <div
      v-if="props.pausedTime && props.state === ContestState.PAUSED"
      ml-2
    >
      {{ props.pausedTime }}
    </div>
  </div>
</template>

<style scoped lang="less">
@import "./Progress.less";
</style>
