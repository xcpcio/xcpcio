<script setup lang="ts">
import { Rank, createContest, createSubmissions, createTeams } from "@xcpcio/core";
import type { Contest, Submissions, Team, Teams } from "@xcpcio/core";
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
  return rank.value.balloons.filter(b => b.submission.timestamp < 1000);
});

function showTeamName(team: Team) {
  const left = team.organization;
  const right = team.name;
  if (right.length === 0) {
    return left;
  }

  if (left.length === 0) {
    return right;
  }

  return `${left} - ${right}`;
}

const setNowIntervalId = setInterval(() => {
  now.value = new Date();
}, 1000);

onUnmounted(() => {
  clearInterval(setNowIntervalId);
});
</script>

<template>
  <div
    class="bg-[#323443]"
    text-gray-200
  >
    <div v-if="!firstLoaded">
      <div
        flex flex-col
        justify-center items-center
        w-screen
        h-screen
        text-xl italic
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
    >
      <div
        flex flex-col justify-between
      >
        <template
          v-for="(b, ix) in balloons"
          :key="b.key"
        >
          <div
            flex flex-row gap-x-4 h-24
            font-mono text-4xl
            :class="[ix % 2 === 0 ? 'bg-resolver-bg-zero' : 'bg-resolver-bg-one']"
          >
            <div
              w-20
              flex flex-shrink-0 justify-center items-center
            >
              {{ b.problem.label }}
            </div>
            <div
              flex flex-1 flex-col justify-center items-start gap-y-3
            >
              <div
                class="resolver-team-name"
                truncate overflow-hidden
              >
                {{ showTeamName(b.team) }}
              </div>
              <div

                flex flex-row text-sm items-start gap-x-2
              />
            </div>

            <div
              w-32 flex flex-shrink-0 flex-row justify-start items-center
            >
              {{ b.submission.timestampToMinute }}
            </div>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>
