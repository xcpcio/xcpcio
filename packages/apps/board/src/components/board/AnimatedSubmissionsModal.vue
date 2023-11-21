<script setup lang="ts">
import type { Rank } from "@xcpcio/core";
import { Submission } from "@xcpcio/core";

import type { AnimatedSubmissionBlockItem } from "~/composables/type";
import { LastBlockDisplayType } from "~/composables/type";

const props = defineProps<{
  rank: Rank,
}>();

const rank = computed(() => props.rank);
const submissions = computed(() => {
  const ss = rank.value.getSubmissions().sort(Submission.compare).reverse();

  let allCnt = 0;
  const allNeed = 10;
  const allRes: AnimatedSubmissionBlockItem[] = [];

  let acceptedCnt = 0;
  const acceptedNeed = 6;
  const acceptedRes: AnimatedSubmissionBlockItem[] = [];

  for (let i = 0; i < ss.length && (acceptedCnt < acceptedNeed || allCnt < allNeed); i++) {
    const s = ss[i];
    const teamId = s.teamId;
    const problemId = s.problemId;

    const team = rank.value.teamsMap.get(teamId);

    if (!team) {
      continue;
    }

    if (rank.value.filterTeamByOrg(team)) {
      continue;
    }

    const problem = rank.value.contest.problemsMap.get(problemId);
    if (!problem) {
      continue;
    }

    let displayName = team.name;

    if (team.organization) {
      displayName = `${team.organization} - ${displayName}`;
    }

    const item: AnimatedSubmissionBlockItem = {
      submission: s,
      team,
      problem,
      displayName,
    };

    if (allCnt < allNeed) {
      allRes.push(item);
      ++allCnt;
    }

    if (s.isFirstSolved && acceptedCnt < acceptedNeed) {
      acceptedRes.push(item);
      ++acceptedCnt;
    }
  }

  acceptedRes.reverse();
  allRes.reverse();

  return {
    acceptedRes,
    allRes,
  };
});

const acceptedSubmissions = computed(() => {
  return submissions.value.acceptedRes;
});

const allSubmissions = computed(() => {
  return submissions.value.allRes;
});
</script>

<template>
  <div
    absolute fixed z-99
    bottom-4 left-4
    opacity-80
  >
    <div
      flex flex-col
    >
      <div>
        <template
          v-for="s in acceptedSubmissions"
          :key="s.id"
        >
          <AnimatedSubmissionBlock
            :item="s"
            :last-block-display-type="LastBlockDisplayType.SUBMIT_TIMESTAMP"
          />
        </template>
      </div>
    </div>

    <div
      flex flex-col
      mt-6
    >
      <div>
        <template
          v-for="s in allSubmissions"
          :key="s.id"
        >
          <AnimatedSubmissionBlock
            :item="s"
            :last-block-display-type="LastBlockDisplayType.SUBMISSION_STATUS"
          />
        </template>
      </div>
    </div>
  </div>
</template>
