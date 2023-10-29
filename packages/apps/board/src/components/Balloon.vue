<script setup lang="ts">
import { Rank, createContest, createSubmissions, createTeams } from "@xcpcio/core";
import type { Contest, Submissions, Teams } from "@xcpcio/core";
import type { Contest as IContest, Submissions as ISubmissions, Teams as ITeams } from "@xcpcio/types";

import { BALLOON_TITLE_SUFFIX } from "~/composables/constant";

const props = defineProps<{
  dataSourceUrl: string,
}>();

const title = useTitle(BALLOON_TITLE_SUFFIX);
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
  title.value = `${contestData.value.name} | ${BALLOON_TITLE_SUFFIX}`;

  teamsData.value = createTeams(data.value?.teams as ITeams);
  submissionsData.value = createSubmissions(data.value?.submissions as ISubmissions);

  reBuildBalloons();

  firstLoaded.value = true;
});

const balloons = computed(() => {
  return rank.value.balloons;
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
          v-for="(b, index) in balloons"
          :key="b.key"
        >
          <BalloonBlock
            :index="index"
            :balloon="b"
          />
        </template>
      </div>
    </div>
  </div>
</template>