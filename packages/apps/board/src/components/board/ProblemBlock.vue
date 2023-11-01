<script setup lang="ts">
import type { Problem, Rank } from "@xcpcio/core";

const props = defineProps<{
  rank: Rank,
  problem: Problem
}>();

const hiddenModal = ref(true);
function onClick() {
  hiddenModal.value = false;
}

const rank = computed(() => props.rank);
const problem = computed(() => props.problem);
</script>

<template>
  <th
    :key="problem.id"
    class="success"
    text-center
    style="width: 3rem;"
    :style="{
      'background-color': problem.balloonColor?.background_color,
      'color': problem.balloonColor?.color,
    }"
  >
    <div
      cursor-pointer
      flex
      flex-col justify-center
      items-center
      @click="onClick"
    >
      <div>
        {{ problem.label }}
      </div>
      <div>
        {{ problem.statistics.acceptedNum }}
      </div>
    </div>

    <div>
      <ProblemInfoModal
        v-if="!hiddenModal"
        v-model:is-hidden="hiddenModal"
        :rank="rank"
        :problem="problem"
      />
    </div>
  </th>
</template>

<style scoped lang="less">
@import "./Standings.less";
</style>
