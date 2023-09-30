<script setup lang="ts">
import { MedalType, type Team } from "@xcpcio/core";

const props = defineProps<{
  team: Team,
}>();

// const team = computed(() => props.team);

const firstSolvedProblems = computed(() => {
  return props.team.problemStatistics.filter((p) => {
    if (p.isFirstSolved) {
      return true;
    }

    return false;
  });
});

interface Medal {
  text: string;
}

const medal = computed((): Medal | null => {
  const awards = props.team.awards;

  if (awards.includes(MedalType.GOLD)) {
    return {
      text: "Gold",
    };
  }

  if (awards.includes(MedalType.SILVER)) {
    return {
      text: "Silver",
    };
  }

  if (awards.includes(MedalType.BRONZE)) {
    return {
      text: "Bronze",
    };
  }

  if (awards.includes(MedalType.HONORABLE)) {
    return {
      text: "Honorable",
    };
  }

  return null;
});
</script>

<template>
  <div
    text-gray-900 dark:text-white
    text-xl
    font-mono font-semibold italic
    flex flex-col gap-2
    justify-center
  >
    <div
      flex flex-col gap-2
    >
      <template
        v-for="p in firstSolvedProblems"
        :key="p.problem.id"
      >
        <div>
          First Solved Problem {{ p.problem.label }}
        </div>
      </template>
    </div>

    <div v-if="medal">
      {{ medal.text }} Medal
    </div>
  </div>
</template>
