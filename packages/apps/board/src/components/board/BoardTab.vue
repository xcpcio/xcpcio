<script setup lang="ts">
import type { Rank } from "@xcpcio/core";

const props = defineProps<{
  rank: Rank,
}>();

const rank = computed(() => props.rank);

const { t } = useI18n();
</script>

<template>
  <div>
    <VTooltip
      w-inherit
    >
      <div
        text-lg
      >
        <div i-material-symbols-info-outline text-lg />
      </div>

      <template #popper>
        <div
          flex
        >
          <div>
            {{ t("standings.options.calculation_of_penalty") }}: {{ t(`standings.options.${rank.contest.options?.calculationOfPenalty}`) }}
          </div>
        </div>
      </template>
    </VTooltip>
  </div>
</template>
