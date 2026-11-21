<script setup lang="ts">
import type { BattleOfGiants } from "@xcpcio/core";

const props = defineProps<{
  battleOfGiants: BattleOfGiants;
}>();

const battleOfGiants = computed(() => props.battleOfGiants);
</script>

<template>
  <div>
    <div
      class="flex flex-wrap items-center justify-center gap-y-2 font-mono text-4xl sm:text-6xl lg:text-8xl"
    >
      <div
        flex justify-end items-center
        text-blue-400
      >
        <div>
          {{ battleOfGiants.blueTeam.name }}
        </div>

        <div
          flex flex-col
          items-center justify-center
          ml-4
        >
          <div
            class="text-3xl sm:text-5xl lg:text-6xl"
          >
            {{ battleOfGiants.blueTeam.totalSolvedProblemNum }}
          </div>

          <div
            class="text-xl sm:text-3xl lg:text-4xl"
          >
            {{ battleOfGiants.blueTeam.totalPenaltyToString }}
          </div>
        </div>
      </div>

      <div
        flex justify-center items-center
        mx-2 lg:mx-4
      >
        :
      </div>

      <div
        flex justify-start items-center
        text-red-400
      >
        <div
          flex flex-col
          items-center justify-center
          mr-4
        >
          <div
            class="text-3xl sm:text-5xl lg:text-6xl"
          >
            {{ battleOfGiants.redTeam.totalSolvedProblemNum }}
          </div>

          <div
            class="text-xl sm:text-3xl lg:text-4xl"
          >
            {{ battleOfGiants.redTeam.totalPenaltyToString }}
          </div>
        </div>

        <div>
          {{ battleOfGiants.redTeam.name }}
        </div>
      </div>
    </div>
  </div>
</template>
