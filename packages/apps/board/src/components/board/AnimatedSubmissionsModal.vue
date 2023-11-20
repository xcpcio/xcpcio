<script setup lang="ts">
import type { Problem, Rank, Team } from "@xcpcio/core";
import { Submission } from "@xcpcio/core";
import { SubmissionStatusToSimpleString } from "@xcpcio/types";

import { getMedalColor } from "~/composables/color";

const props = defineProps<{
  rank: Rank,
}>();

interface Item {
  submission: Submission,
  team: Team,
  problem: Problem,
  displayName: string,
}

const rank = computed(() => props.rank);
const submissions = computed(() => {
  const ss = rank.value.getSubmissions().sort(Submission.compare).reverse();

  let allCnt = 0;
  const allNeed = 12;
  const allRes: Item[] = [];

  let acceptedCnt = 0;
  const acceptedNeed = 8;
  const acceptedRes: Item[] = [];

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

    const item: Item = {
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
    opacity-90
  >
    <div
      flex flex-col
    >
      <div>
        <template
          v-for="(s, index) in acceptedSubmissions"
          :key="s.id"
        >
          <div
            w-118
            h-6
            text-gray-200
            font-mono
            flex flex-row
            justify-center items-center
            :class="[index % 2 === 0 ? 'bg-resolver-bg-zero' : 'bg-resolver-bg-one']"
          >
            <div
              w-12
              :style="getMedalColor(s.team)"
              flex
              justify-center items-center
            >
              <div>
                {{ s.team.rank }}
              </div>
            </div>

            <div
              pl-1
              w-108
              truncate
            >
              {{ s.displayName }}
            </div>

            <div
              w-5
            >
              {{ s.team.solvedProblemNum }}
            </div>

            <div
              w-8
              border-b-4
              flex justify-center
              :style="{
                borderColor: s.problem.balloonColor.background_color,
              }"
            >
              {{ s.problem.label }}
            </div>

            <div
              w-14
              flex justify-center
              font-sans font-medium
              :class="[s.submission.status]"
              :style="{
                color: '#000',
              }"
            >
              {{ s.submission.timestampToMinute }}
            </div>
          </div>
        </template>
      </div>
    </div>

    <div
      flex flex-col
      mt-6
    >
      <div>
        <template
          v-for="(s, index) in allSubmissions"
          :key="s.id"
        >
          <div
            w-118
            h-6
            text-gray-200
            font-mono
            flex flex-row
            justify-center items-center
            :class="[index % 2 === 0 ? 'bg-resolver-bg-zero' : 'bg-resolver-bg-one']"
          >
            <div
              w-12
              :style="getMedalColor(s.team)"
              flex
              justify-center items-center
            >
              <div>
                {{ s.team.rank }}
              </div>
            </div>

            <div
              pl-1
              w-108
              truncate
            >
              {{ s.displayName }}
            </div>

            <div
              w-5
            >
              {{ s.team.solvedProblemNum }}
            </div>

            <div
              w-8
              border-b-4
              flex justify-center
              :style="{
                borderColor: s.problem.balloonColor.background_color,
              }"
            >
              {{ s.problem.label }}
            </div>

            <div
              w-14
              flex justify-center
              font-sans font-medium
              :class="[s.submission.status]"
              :style="{
                color: '#000',
              }"
            >
              {{ SubmissionStatusToSimpleString[s.submission.status] }}
            </div>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<style scoped lang="less">
@import "../../styles/submission-status-background.css";
</style>
