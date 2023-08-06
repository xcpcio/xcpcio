<script setup lang="ts">
import { type Contest, type Submissions, type Teams, createContest, createSubmissions, createTeams } from "@xcpcio/core";
import type { Contest as IContest, Submissions as ISubmissions, Teams as ITeams } from "@xcpcio/types";

const route = useRoute();
const { t } = useI18n();

const firstLoaded = ref(false);
const contest = ref({} as Contest);
const teams = ref([] as Teams);
const submissions = ref([] as Submissions);

const { data, isError, error } = useQueryBoardData(route.fullPath);
watch(data, async (newBoardData) => {
  if (newBoardData === undefined || newBoardData === null) {
    return;
  }

  contest.value = createContest(newBoardData?.contest as IContest);
  teams.value = createTeams(newBoardData?.teams as ITeams);
  submissions.value = createSubmissions(newBoardData?.submissions as ISubmissions);

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

    <div v-if="firstLoaded" class="pt-5">
      {{ contest.name }}
    </div>
  </div>
</template>
