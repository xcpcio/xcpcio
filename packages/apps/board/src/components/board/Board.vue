<script setup lang="ts">
import _ from "lodash";
import { useRouteQuery } from "@vueuse/router";
import { Rank, RankOptions, createContest, createSubmissions, createTeams } from "@xcpcio/core";
import type { Contest, Submissions, Teams } from "@xcpcio/core";
import type { Contest as IContest, Submissions as ISubmissions, Teams as ITeams } from "@xcpcio/types";

import type { Item } from "~/components/board/SecondLevelMenu.vue";

const route = useRoute();
const title = useTitle();
const { t } = useI18n();

const firstLoaded = ref(false);
const contestData = ref({} as Contest);
const teamsData = ref([] as Teams);
const submissionsData = ref([] as Submissions);
const rank = ref({} as Rank);
const now = ref(new Date());
const rankOptions = ref(new RankOptions());

(() => {
  const filterOrganizations = useLocalStorageForFilterOrganizations();
  const filterTeams = useLocalStorageForFilterTeams();

  if (filterOrganizations.value.length > 0) {
    rankOptions.value.setFilterOrganizations(filterOrganizations.value);
  }

  if (filterTeams.value.length > 0) {
    rankOptions.value.setFilterTeams(filterTeams.value);
  }
})();

const currentGroup = ref("all");
function onChangeCurrentGroup(nextGroup: string) {
  if (nextGroup === rankOptions.value.group) {
    return;
  }

  rankOptions.value.setGroup(nextGroup);
}
(() => {
  const currentGroupFromRouteQuery = useRouteQuery(
    "group",
    "all",
    { transform: String },
  );

  currentGroup.value = currentGroupFromRouteQuery.value;
  rankOptions.value.setGroup(currentGroupFromRouteQuery.value);
})();

function reBuildRank() {
  const newRank = new Rank(contestData.value, teamsData.value, submissionsData.value);
  newRank.options = _.cloneDeep(rankOptions.value);
  newRank.buildRank();
  rank.value = newRank;
}

const { data, isError, error } = useQueryBoardData(route.path, now);
watch(data, async () => {
  if (data.value === null || data.value === undefined) {
    return;
  }

  contestData.value = createContest(data.value?.contest as IContest);
  title.value = `${contestData.value.name} - XCPCIO Board`;

  teamsData.value = createTeams(data.value?.teams as ITeams);
  submissionsData.value = createSubmissions(data.value?.submissions as ISubmissions);

  if (rankOptions.value.enableFilterSubmissionsByTimestamp) {
    return;
  }

  reBuildRank();

  firstLoaded.value = true;
});

const isReBuildRank = ref(false);
watch(rankOptions.value, () => {
  if (firstLoaded.value === false) {
    return;
  }

  if (!rank.value.options.isNeedReBuildRank(rankOptions.value)) {
    rank.value.options = _.cloneDeep(rankOptions.value);
    return;
  }

  if (isReBuildRank.value === true) {
    return;
  }

  isReBuildRank.value = true;

  reBuildRank();

  isReBuildRank.value = false;
});

const typeMenuList = ref<Array<Item>>([
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
  {
    title: "type_menu.options",
    keyword: "options",
    isModal: true,
  },
]);

const group = computed(() => {
  return rank.value.contest.group;
});

const groupMenuList = computed(() => {
  const res = Array<Item>();

  for (const [k, v] of group.value) {
    const item = {
      titles: v.names,
      defaultLang: v.defaultLang,
      keyword: k,
      isDefault: v.isDefault,
    };

    res.push(item);
  }

  return res;
});

const currentType = ref("rank");
const isHiddenOptionsModal = ref(true);

function onChangeCurrentType(type: string) {
  if (type === "options") {
    isHiddenOptionsModal.value = false;
  }
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

const wrapperWidthClass = "sm:w-[1280px] xl:w-screen";
const widthClass = "sm:w-[1260px] xl:w-screen";
</script>

<template>
  <div v-if="!firstLoaded">
    <div
      w-screen
      flex justify-center items-center
    >
      {{ t("common.loading") }}...

      <div v-if="isError">
        {{ error }}
      </div>
    </div>
  </div>

  <div
    v-if="firstLoaded"
    :class="[wrapperWidthClass]"
    flex flex-col justify-center items-center
  >
    <div
      v-if="rank.contest.banner"
    >
      <div
        :class="[widthClass]"
        mb-4
        flex justify-center items-center
      >
        <div class="max-w-[92%]">
          <img
            :src="['data:image/png;base64,', rank.contest.banner?.base64].join('')"
            alt="banner"
          >
        </div>
      </div>
    </div>

    <div
      class="title"
      :class="[widthClass]"
      flex justify-center
      text-center text-3xl font-normal font-serif
    >
      <div class="max-w-[92%]">
        {{ rank.contest.name }}
      </div>
    </div>

    <div
      :class="[widthClass]"
      mt-4
      flex flex-row justify-center
    >
      <div class="w-[92%]">
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
          <div class="float-left">
            <SecondLevelMenu
              v-model:current-item="currentGroup"
              :items="groupMenuList"
              query-param-name="group"
              :on-change="onChangeCurrentGroup"
            />
          </div>
          <div class="flex-1" />
          <div class="float-right">
            <SecondLevelMenu
              v-model:current-item="currentType"
              :items="typeMenuList"
              :reverse-order="true"
              query-param-name="type"
              :on-change="onChangeCurrentType"
            />
          </div>
        </div>
      </div>
    </div>

    <div
      mt-4
      :class="[widthClass]"
      flex justify-center
    >
      <div
        class="max-w-[92%]"
      >
        <div
          v-if="currentType === 'rank'"
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
        >
          <Statistics
            :rank="rank"
          />
        </div>

        <div
          v-if="currentType === 'balloon'"
        >
          <Balloon
            :rank="rank"
          />
        </div>

        <div
          v-if="currentType === 'export'"
        >
          <Export
            :rank="rank"
          />
        </div>
      </div>
    </div>
  </div>

  <OptionsModal
    v-if="!isHiddenOptionsModal"
    v-model:is-hidden="isHiddenOptionsModal"
    v-model:rank-options="rankOptions"
    :rank="rank"
  />
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
