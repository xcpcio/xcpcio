<script setup lang="ts">
import { RatingLevelToString, RatingUtility } from "@xcpcio/core";

import "./rating.less";

const props = defineProps<{
  rating: number
}>();

const rating = computed(() => props.rating);
</script>

<template>
  <div>
    <Tooltip>
      <div
        font-mono font-bold
        :class="RatingUtility.getRatingLevelClass(rating)"
      >
        {{ rating }}
      </div>

      <template #popper>
        <div
          text-md
        >
          {{ RatingLevelToString[RatingUtility.getRatingLevel(rating)] }}
        </div>
      </template>
    </Tooltip>
  </div>
</template>
