<script setup lang="ts">
import { Rank, createContest, createSubmissions, createTeams } from "@xcpcio/core";
import type { Contest, Submissions, Teams } from "@xcpcio/core";
import type { Contest as IContest, Submissions as ISubmissions, Teams as ITeams } from "@xcpcio/types";

const route = useRoute();
const { t } = useI18n();

const firstLoaded = ref(false);
const contest = ref({} as Contest);
const teams = ref([] as Teams);
const submissions = ref([] as Submissions);
const rank = ref({} as Rank);

const { data, isError, error } = useQueryBoardData(route.fullPath);

watchEffect(async () => {
  if (data.value === null || data.value === undefined) {
    return;
  }

  contest.value = createContest(data.value?.contest as IContest);
  teams.value = createTeams(data.value?.teams as ITeams);
  submissions.value = createSubmissions(data.value?.submissions as ISubmissions);
  const newRank = new Rank(contest.value, teams.value, submissions.value);
  newRank.buildRank();
  rank.value = newRank;

  firstLoaded.value = true;
});
</script>

<template>
  <div class="flex items-center justify-center">
    <div v-if="!firstLoaded">
      {{ t("common.loading") }}...

      <div v-if="isError">
        {{ error }}
      </div>
    </div>

    <div v-if="firstLoaded">
      <div class="title font-serif text-3xl font-normal">
        {{ contest.name }}
      </div>

      <Standings :rank="rank" />
    </div>
  </div>
</template>

<style scoped>
.title {
  --scroll-bar: 0;
  font-variant: tabular-nums;
  line-height: 1.5715;
  box-sizing: border-box;
  position: relative;
  overflow: hidden;
  text-align: center;
}
</style>
