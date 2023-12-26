<script setup lang="ts">
import type { BattleOfGiants } from "@xcpcio/core/index";

const props = defineProps<{
  battleOfGiants: BattleOfGiants
}>();

const battleOfGiants = computed(() => props.battleOfGiants);
</script>

<template>
  <div>
    <div
      text-8xl font-mono
      flex justify-center items-center
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
            text-6xl
          >
            {{ battleOfGiants.blueTeam.totalSolvedProblemNum }}
          </div>

          <div
            text-4xl
          >
            {{ battleOfGiants.blueTeam.totalPenaltyToString }}
          </div>
        </div>
      </div>

      <div
        flex justify-center items-center
        ml-4 mr-4
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
            text-6xl
          >
            {{ battleOfGiants.redTeam.totalSolvedProblemNum }}
          </div>

          <div
            text-4xl
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
