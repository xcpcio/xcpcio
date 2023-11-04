<script setup lang="ts">
import type { Problem, Rank, Team } from "@xcpcio/core";
import { Submission } from "@xcpcio/core";
import { SubmissionStatusToSimpleString } from "@xcpcio/types";

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

  const res: Item[] = [];

  let cnt = 0;
  const need = 16;
  for (let i = 0; i < ss.length && cnt < need; i++) {
    const s = ss[i];
    const teamId = s.teamId;
    const problemId = s.problemId;

    const team = rank.value.teamsMap.get(teamId);

    if (!team) {
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

    res.push({
      submission: s,
      team,
      problem,
      displayName,
    });

    ++cnt;
  }

  return res.reverse();
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
          v-for="s in submissions"
          :key="s.id"
        >
          <div
            w-104
            h-6
            bg-slate-800 text-gray-200
            font-mono
            flex flex-row
            pl-2
          >
            <div
              w-8
            >
              {{ s.team.rank }}
            </div>

            <div
              pl-2
              w-80
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
                'border-color': s.problem.balloonColor?.background_color.toString(),
              }"
            >
              {{ s.problem.label }}
            </div>

            <div
              w-10
              flex justify-center
              :class="[s.submission.status]"
              opacity-100
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
