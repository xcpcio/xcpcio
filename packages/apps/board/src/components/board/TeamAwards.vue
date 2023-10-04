<script setup lang="ts">
import { MedalType } from "@xcpcio/core";
import type { Rank, Team } from "@xcpcio/core";

const props = defineProps<{
  team: Team,
  rank: Rank,
}>();

const team = computed(() => props.team);
const rank = computed(() => props.rank);

const firstSolvedProblems = computed(() => {
  return props.team.problemStatistics.filter((p) => {
    if (p.isFirstSolved) {
      return true;
    }

    return false;
  }).map(p => p.problem.label).join(",");
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
    <div>
      Team Rank: {{ team.rank }}
    </div>

    <div
      v-if="team.organization && team.organizationRank !== -1"
    >
      {{ rank.contest.organization }} Rank: {{ team.organizationRank }}
    </div>

    <div
      v-if="firstSolvedProblems.length"
      flex flex-col gap-2
    >
      <div>
        First Solved Problem {{ firstSolvedProblems }}
      </div>
    </div>

    <div
      v-if="medal"
    >
      {{ medal.text }} Medal
    </div>
  </div>
</template>
