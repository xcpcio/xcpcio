<script setup lang="ts">
import { type Contest, type Submissions, type Teams, createContest, createSubmissions, createTeams } from "@xcpcio/core";
import type { Contest as IContest, Submissions as ISubmissions, Teams as ITeams } from "@xcpcio/types";

const route = useRoute();
const { t } = useI18n();

const firstLoaded = ref(false);
const contest = ref({} as Contest);
const teams = ref([] as Teams);
const submissions = ref([] as Submissions);

const { isError, data, error } = useQueryBoardData(route.fullPath);
const boardData = data;

watch(boardData, async (newBoardData) => {
  if (newBoardData !== undefined && newBoardData !== null) {
    firstLoaded.value = true;
  }

  contest.value = createContest(newBoardData?.contest as IContest);
  teams.value = createTeams(newBoardData?.teams as ITeams);
  submissions.value = createSubmissions(newBoardData?.submissions as ISubmissions);
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
      {{ contest }}
    </div>
  </div>
</template>
