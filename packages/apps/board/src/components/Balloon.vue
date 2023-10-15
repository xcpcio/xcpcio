<script setup lang="ts">
import { Rank, createContest, createSubmissions, createTeams } from "@xcpcio/core";
import type { Contest, Submissions, Teams } from "@xcpcio/core";
import { type Contest as IContest, type Submissions as ISubmissions, type Teams as ITeams } from "@xcpcio/types";

const props = defineProps<{
  dataSourceUrl: string,
}>();

const title = useTitle();
const { t } = useI18n();

const firstLoaded = ref(false);
const contestData = ref({} as Contest);
const teamsData = ref([] as Teams);
const submissionsData = ref([] as Submissions);
const rank = ref({} as Rank);
const now = ref(new Date());

function reBuildBalloons() {
  const newRank = new Rank(contestData.value, teamsData.value, submissionsData.value);
  newRank.buildBalloons();
  rank.value = newRank;
}

const { data, isError, error } = useQueryBoardData(props.dataSourceUrl, now);
watch(data, async () => {
  if (data.value === null || data.value === undefined) {
    return;
  }

  contestData.value = createContest(data.value?.contest as IContest);
  title.value = `${contestData.value.name} - XCPCIO Balloon`;

  teamsData.value = createTeams(data.value?.teams as ITeams);
  submissionsData.value = createSubmissions(data.value?.submissions as ISubmissions);

  reBuildBalloons();

  firstLoaded.value = true;
});

const balloons = computed(() => {
  return rank.value.balloons.filter(b => b.submission.timestamp < 500);
});

const setNowIntervalId = setInterval(() => {
  now.value = new Date();
}, 1000);

onUnmounted(() => {
  clearInterval(setNowIntervalId);
});
</script>

<template>
  <div
    flex flex-justify-center
  >
    <div v-if="!firstLoaded">
      <div
        flex flex-col gap-4 justify-center items-center
      >
        <div>
          {{ t("common.loading") }}...
        </div>

        <div v-if="isError">
          {{ error }}
        </div>
      </div>
    </div>

    <div
      v-else
      flex flex-col justify-center gap-4
    >
      <template
        v-for="(b, ix) in balloons"
        :key="b.key"
      >
        <div
          flex flex-row gap-x-4 h-24 font-mono text-4xl
          :class="[ix % 2 === 0 ? 'bg-resolver-bg-zero' : 'bg-resolver-bg-one']"
          bg-resolver-bg-one
        >
          {{ b.team.organization }} {{ b.team.name }} {{ b.problem.label }} {{ b.submission.timestampToMinute }}
        </div>
      </template>
    </div>
  </div>
</template>
