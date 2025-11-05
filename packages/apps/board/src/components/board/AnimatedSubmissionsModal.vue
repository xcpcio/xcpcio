<script setup lang="ts">
import type { AnimatedSubmissionBlockItem, Lang } from "@board/composables/type";
import type { Rank } from "@xcpcio/core";

import { LastBlockDisplayType } from "@board/composables/type";
import { Submission } from "@xcpcio/core";

const props = defineProps<{
  rank: Rank;
}>();

const { locale } = useI18n();
const lang = computed(() => locale.value as unknown as Lang);

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
      displayName = `${team.organization.name.getOrDefault(lang.value)} - ${displayName}`;
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

    if (s.isSolved && acceptedCnt < acceptedNeed) {
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
        <TransitionGroup name="list" tag="ul">
          <div
            v-for="s in acceptedSubmissions"
            :key="s.submission.id"
          >
            <AnimatedSubmissionBlock
              :item="s"
              :last-block-display-type="LastBlockDisplayType.SUBMIT_TIMESTAMP"
            />
          </div>
        </TransitionGroup>
      </div>
    </div>

    <div
      flex flex-col
      mt-6
    >
      <div>
        <TransitionGroup name="list" tag="ul">
          <div
            v-for="s in allSubmissions"
            :key="s.submission.id"
          >
            <div>
              <AnimatedSubmissionBlock
                :item="s"
                :last-block-display-type="LastBlockDisplayType.SUBMISSION_STATUS"
              />
            </div>
          </div>
        </TransitionGroup>
      </div>
    </div>
  </div>
</template>

<style scoped>
.list-enter-active {
  transition: all 2s ease;
}

.list-leave-active {
  transition: all 0.75s ease;
}

.list-enter-from,
.list-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}
</style>
