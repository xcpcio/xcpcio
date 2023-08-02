<script setup lang="ts">
import type { ContestIndex } from "@xcpcio/core";
import { useElementVisibility } from "@vueuse/core";

const props = defineProps<{
  data: ContestIndex
}>();

const el = ref(null);
const isVisible = useElementVisibility(el);
</script>

<template>
  <div ref="el">
    <div h-32>
      <div v-if="isVisible">
        {{ props.data.config.startTime.format("YYYY-MM-DD HH:mm:ss") }}<sup>{{ props.data.config.startTime.format("z") }}</sup>
        <br>
        {{ props.data.config.contestName }}
      </div>
      <div v-else>
        {{ isVisible }}
      </div>
    </div>
  </div>
</template>
