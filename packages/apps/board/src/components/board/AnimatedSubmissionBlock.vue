<script setup lang="ts">
import { SubmissionStatusToSimpleString } from "@xcpcio/types";

import { getMedalColor } from "~/composables/color";
import type { AnimatedSubmissionBlockItem } from "~/composables/type";
import { LastBlockDisplayType } from "~/composables/type";

const props = defineProps<{
  item: AnimatedSubmissionBlockItem;
  lastBlockDisplayType: LastBlockDisplayType;
}>();

const item = computed(() => props.item);

function getLastBlockDisplayContent() {
  const s = item.value.submission;

  if (props.lastBlockDisplayType === LastBlockDisplayType.SUBMISSION_STATUS) {
    return SubmissionStatusToSimpleString[s.status];
  }

  if (props.lastBlockDisplayType === LastBlockDisplayType.SUBMIT_TIMESTAMP) {
    return s.timestampToMinute;
  }
}
</script>

<template>
  <div
    h-7 w-124
    text-gray-200
    font-mono
    flex flex-row
    justify-center items-center
    class="bg-resolver-bg-zero"
  >
    <div
      h-full w-10
      :style="getMedalColor(item.team)"
      flex
      justify-center items-center
    >
      <div>
        {{ item.team.rank }}
      </div>
    </div>

    <div
      h-full w-92
      pl-1
      truncate
    >
      {{ item.displayName }}
    </div>

    <div
      h-full w-4
    >
      {{ item.team.solvedProblemNum }}
    </div>

    <div
      h-full w-6
      border-b-3
      flex justify-center
      :style="{
        borderColor: item.problem.balloonColor.background_color,
      }"
    >
      {{ item.problem.label }}
    </div>

    <div
      h-full w-12
      flex justify-center
      font-sans font-medium
      text-zinc-800
      :style="{
        backgroundColor: getStandingsStatusColor(item.submission),
      }"
    >
      {{ getLastBlockDisplayContent() }}
    </div>
  </div>
</template>
