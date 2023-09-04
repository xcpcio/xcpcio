<script setup lang="ts">
import { Rank, RankOptions, createContest, createSubmissions, createTeams } from "@xcpcio/core";
import type { Contest, Submissions, Teams } from "@xcpcio/core";
import type { Contest as IContest, Submissions as ISubmissions, Teams as ITeams } from "@xcpcio/types";
import { useRouteQuery } from "@vueuse/router";

import type { Item } from "~/components/board/SecondLevelMenu.vue";

const route = useRoute();
const { t } = useI18n();

const firstLoaded = ref(false);
const contestData = ref({} as Contest);
const teamsData = ref([] as Teams);
const submissionsData = ref([] as Submissions);
const rank = ref({} as Rank);
const now = ref(new Date());
const rankOptions = ref(new RankOptions());

const isReBuildRank = ref(false);

const { data, isError, error } = useQueryBoardData(route.path, now);
watch(data, async () => {
  if (data.value === null || data.value === undefined) {
    return;
  }

  if (rankOptions.value.enableFilterSubmissionsByTimestamp) {
    return;
  }

  contestData.value = createContest(data.value?.contest as IContest);

  teamsData.value = createTeams(data.value?.teams as ITeams);
  submissionsData.value = createSubmissions(data.value?.submissions as ISubmissions);

  const newRank = new Rank(contestData.value, teamsData.value, submissionsData.value);
  newRank.options = rankOptions.value;
  newRank.buildRank();
  rank.value = newRank;

  firstLoaded.value = true;
});

watch(rankOptions.value, () => {
  if (isReBuildRank.value === true) {
    return;
  }

  isReBuildRank.value = true;

  rank.value.options = rankOptions.value;
  rank.value.buildRank();

  isReBuildRank.value = false;
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
  return `${t("standings.start_time")}${t("common.colon")}${time}`;
});

const endTime = computed(() => {
  const time = rank.value.contest.endTime.format("YYYY-MM-DD HH:mm:ss");
  return `${t("standings.end_time")}${t("common.colon")}${time}`;
});

const elapsedTime = computed(() => {
  const time = rank.value.contest.getContestElapsedTime(now.value);
  return `${t("standings.elapsed")}${t("common.colon")}${time}`;
});

const remainingTime = computed(() => {
  const time = rank.value.contest.getContestRemainingTime(now.value);
  return `${t("standings.remaining")}${t("common.colon")}${time}`;
});

const setNowIntervalId = setInterval(() => {
  now.value = new Date();
}, 1000);

onUnmounted(() => {
  clearInterval(setNowIntervalId);
});
</script>

<template>
  <div v-if="!firstLoaded">
    <div class="flex items-center justify-center">
      {{ t("common.loading") }}...

      <div v-if="isError">
        {{ error }}
      </div>
    </div>
  </div>

  <div v-if="firstLoaded">
    <div v-if="rank.contest.banner">
      <div class="mb-4 flex items-center justify-center">
        <div class="max-w-[92vw]">
          <img
            :src="['data:image/png;base64,', rank.contest.banner?.base64].join('')"
            alt="banner"
          >
        </div>
      </div>
    </div>

    <div class="title max-w-screen flex justify-center text-center text-3xl font-normal font-serif">
      <div class="max-w-[92vw]">
        {{ rank.contest.name }}
      </div>
    </div>

    <div class="mt-4 max-w-screen flex flex-row justify-center">
      <div class="w-[92vw]">
        <div class="flex font-bold font-mono">
          <div class="float-left">
            {{ startTime }}<sup class="pl-0.5">{{ rank.contest.startTime.format("z") }}</sup>
          </div>
          <div class="flex-1">
            <ContestStateBadge
              :state="rank.contest.getContestState(now)"
              :pending-time="rank.contest.getContestPendingTime(now)"
            />
          </div>
          <div class="float-right">
            {{ endTime }}<sup class="pl-0.5">{{ rank.contest.endTime.format("z") }}</sup>
          </div>
        </div>

        <div class="mt-2">
          <Progress
            v-model:rank-options="rankOptions"
            :width="rank.contest.getContestProgressRatio(now)"
            :state="rank.contest.getContestState(now)"
            :need-scroll="true"
            :rank="rank"
            :elapsed-time="rank.contest.getContestElapsedTime(now)"
          />
        </div>

        <div class="mt-2 flex font-bold font-mono">
          <div class="float-left">
            {{ elapsedTime }}
          </div>
          <div class="flex-1">
            <StandingsAnnotate />
          </div>
          <div class="float-right">
            {{ remainingTime }}
          </div>
        </div>

        <div class="mt-4 flex">
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

    <div
      class="mt-4 max-w-screen"
      flex justify-center
    >
      <div class="max-w-[92vw]">
        <div
          v-if="currentType === 'rank'"
          class=""
        >
          <Standings
            :rank="rank"
          />
        </div>

        <div
          v-if="currentType === 'submissions'"
          class="w-[88vw]"
        >
          <SubmissionsTable
            w-full
            :rank="rank"
            :submissions="rank.getSubmissions()"
          />
        </div>

        <div
          v-if="currentType === 'statistics'"
          class=""
        >
          <Statistics
            :rank="rank"
          />
        </div>

        <div
          v-if="currentType === 'balloon'"
          class=""
        >
          <Balloon
            :rank="rank"
          />
        </div>

        <div
          v-if="currentType === 'export'"
          class=""
        >
          <Export
            :rank="rank"
          />
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
