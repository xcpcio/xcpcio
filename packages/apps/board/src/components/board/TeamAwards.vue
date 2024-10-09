<script setup lang="ts">
import type { Rank, Team } from "@xcpcio/core";
import { MedalType } from "@xcpcio/core";

const props = defineProps<{
  team: Team;
  rank: Rank;
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

const place = computed(() => {
  let r = team.value.rank;

  if (rank.value.contest.organization) {
    r = team.value.organizationRank;
  }

  if (r === 1) {
    return "1st Place";
  }

  if (r === 2) {
    return "2nd Place";
  }

  if (r === 3) {
    return "3rd Place";
  }

  return "";
});
</script>

<template>
  <div
    text-gray-900 dark:text-white
    text-xl
    font-mono font-semibold italic
    flex flex-col gap-2
    justify-center items-center
  >
    <div
      flex flex-col
      items-start
      gap-y-2
    >
      <div
        v-if="medal"
      >
        {{ medal.text }} Medalist
      </div>

      <div
        v-if="place.length > 0"
      >
        {{ place }}
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
        v-if="team.solvedProblemNum > 0"
      >
        Solved {{ team.solvedProblemNum }} {{ team.solvedProblemNum > 1 ? 'Problems' : 'Problem' }}
      </div>
    </div>
  </div>
</template>
