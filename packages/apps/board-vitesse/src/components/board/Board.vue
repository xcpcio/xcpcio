<script setup lang="ts">
import { Rank, createContest, createSubmissions, createTeams } from "@xcpcio/core";
import type { Contest, Submissions, Teams } from "@xcpcio/core";
import type { Contest as IContest, Submissions as ISubmissions, Teams as ITeams } from "@xcpcio/types";
import { useRouteQuery } from "@vueuse/router";

import type { Item } from "~/components/board/SecondLevelMenu.vue";

const route = useRoute();
const { t } = useI18n();

const firstLoaded = ref(false);
const contest = ref({} as Contest);
const teams = ref([] as Teams);
const submissions = ref([] as Submissions);
const rank = ref({} as Rank);
const now = ref(new Date());

const { data, isError, error } = useQueryBoardData(route.path);

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

const currentTypeFromQuery = useRouteQuery("type", "rank", { transform: String });
const currentType = ref(currentTypeFromQuery.value);

const secondLevelMenuList = ref<Array<Item>>([
  {
    title: "type_menu.rank",
    keyword: "rank",
    isDefault: true,
  },
  {
    title: "type_menu.submissions",
    keyword: "submissions",
  },
  {
    title: "type_menu.statistics",
    keyword: "statistics",
  },
  {
    title: "type_menu.balloon",
    keyword: "balloon",
  },
  {
    title: "type_menu.export",
    keyword: "export",
  },
  {
    title: "type_menu.resolver",
    keyword: "resolver",
    link: `https://resolver.xcpcio.com/resolver?xcpcio-data-source=${route.path}`,
  },
]);

function handleUpdateType(type: string) {
  currentType.value = type;
}

const startTime = computed(() => {
  const time = rank.value.contest.startTime.format("YYYY-MM-DD HH:mm:ss");
  return `${t("standings.start_time")}${time}`;
});

const endTime = computed(() => {
  const time = rank.value.contest.endTime.format("YYYY-MM-DD HH:mm:ss");
  return `${t("standings.end_time")}${time}`;
});
</script>

<template>
  <div v-if="!firstLoaded">
    <div class="flex justify-center items-center">
      {{ t("common.loading") }}...

      <div v-if="isError">
        {{ error }}
      </div>
    </div>
  </div>

  <div v-if="firstLoaded">
    <div class="title font-serif text-center font-normal text-3xl max-w-screen flex justify-center">
      <div class="max-w-[92vw]">
        {{ contest.name }}
      </div>
    </div>

    <div class="flex justify-center max-w-screen flex-row mt-4">
      <div class="w-[92vw]">
        <div class="flex font-mono font-bold">
          <div class="float-left">
            {{ startTime }}<sup class="pl-0.5">{{ rank.contest.startTime.format("z") }}</sup>
          </div>
          <div class="flex-1">
            <ContestStateBadge
              :state="rank.contest.getContestState(now)"
            />
          </div>
          <div class="float-right">
            {{ endTime }}<sup class="pl-0.5">{{ rank.contest.endTime.format("z") }}</sup>
          </div>
        </div>

        <div class="mt-2">
          <Progress
            :width="rank.contest.getContestProgressRatio(now)"
            :state="rank.contest.getContestState(now)"
          />
        </div>

        <div class="flex mt-4">
          <div class="float-left" />
          <div class="flex-1" />
          <div class="float-right">
            <SecondLevelMenu
              :items="secondLevelMenuList"
              @update-type="handleUpdateType"
            />
          </div>
        </div>
      </div>
    </div>

    <div class="mt-4 max-w-screen flex justify-center">
      <div class="max-w-[92vw]">
        <div
          v-if="currentType === 'rank'"
        >
          <Standings :rank="rank" />
        </div>

        <div
          v-if="currentType === 'submissions'"
          class=""
        >
          <SubmissionsTable :rank="rank" />
        </div>

        <div
          v-if="currentType === 'statistics'"
          class=""
        >
          <Statistics :rank="rank" />
        </div>

        <div
          v-if="currentType === 'balloon'"
          class=""
        >
          <Balloon :rank="rank" />
        </div>

        <div
          v-if="currentType === 'export'"
          class=""
        >
          <Export :rank="rank" />
        </div>
      </div>
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
