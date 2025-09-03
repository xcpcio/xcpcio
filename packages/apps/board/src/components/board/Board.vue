<script setup lang="ts">
import type { Contest, Submissions, Teams } from "@xcpcio/core";
import type { Contest as IContest, Submissions as ISubmissions, Teams as ITeams } from "@xcpcio/types";
import type { Item } from "~/components/board/SecondLevelMenu.vue";

import { onKeyStroke, useDocumentVisibility, useIntervalFn, useNow } from "@vueuse/core";
import { useRouteQuery } from "@vueuse/router";

import { createContest, createSubmissions, createTeams, getImageSource, getTimeDiff, Rank, RankOptions } from "@xcpcio/core";
import { ContestState } from "@xcpcio/types";
import _ from "lodash";

import { TITLE_SUFFIX } from "~/composables/constant";

const props = defineProps<{
  dataSourceUrl?: string;
}>();

const route = useRoute();
const title = useTitle(TITLE_SUFFIX);
const { t } = useI18n();

const firstLoaded = ref(false);
const contestData = ref({} as Contest);
const teamsData = ref([] as Teams);
const submissionsData = ref([] as Submissions);
const rank = ref({} as Rank);
const now = useNow();
const rankOptions = ref(new RankOptions());

const enableAutoScroll = ref(false);

function fixPath(path: string) {
  return path.replaceAll("%2F", "/");
}

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

(() => {
  const routeQueryForBattleOfGiants = useRouteQueryForBattleOfGiants();
  if (
    routeQueryForBattleOfGiants.value !== null
    && routeQueryForBattleOfGiants.value !== undefined
  ) {
    rankOptions.value.battleOfGiants.FromBase64(routeQueryForBattleOfGiants.value);
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
    /* name */ "group",
    /* defaultValue */ "all",
    { transform: String },
  );

  currentGroup.value = currentGroupFromRouteQuery.value;
  rankOptions.value.setGroup(currentGroupFromRouteQuery.value);
})();

const replayStartTime = useRouteQuery("replay-start-time", 0, { transform: Number });

const isReBuildRank = ref(false);
function reBuildRank(options = { force: false }) {
  if (enableAutoScroll.value && options.force === false) {
    return;
  }

  if (isReBuildRank.value === true) {
    return;
  }

  isReBuildRank.value = true;

  const newRank = new Rank(contestData.value, teamsData.value, submissionsData.value);
  newRank.options = _.cloneDeep(rankOptions.value);
  newRank.setReplayTime(replayStartTime.value);

  newRank.buildRank();
  rank.value = newRank;

  isReBuildRank.value = false;
}

const { data, isError, error, refetch } = useQueryBoardData(props.dataSourceUrl ?? fixPath(route.path), now);
watch(data, async () => {
  if (data.value === null || data.value === undefined) {
    return;
  }

  contestData.value = createContest(data.value?.contest as IContest);
  title.value = `${contestData.value.name} | ${TITLE_SUFFIX}`;

  teamsData.value = createTeams(data.value?.teams as ITeams);
  submissionsData.value = createSubmissions(data.value?.submissions as ISubmissions);

  if (rankOptions.value.enableFilterSubmissionsByTimestamp) {
    return;
  }

  reBuildRank();

  firstLoaded.value = true;
}, { immediate: true });

function dynamicReBuildRank() {
  if (firstLoaded.value === false) {
    return;
  }

  reBuildRank();
}

watch(rankOptions.value, () => {
  if (!rank.value.options.isNeedReBuildRank(rankOptions.value)) {
    rank.value.options = _.cloneDeep(rankOptions.value);
    return;
  }

  dynamicReBuildRank();
});

{
  const { pause, resume } = useIntervalFn(() => {
    dynamicReBuildRank();
  }, 1000);

  function onChange() {
    if (replayStartTime.value === 0) {
      pause();
    } else {
      dynamicReBuildRank();
      resume();
    }
  }

  onChange();

  watch(replayStartTime, () => {
    onChange();
  });
}

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
    title: "type_menu.export",
    keyword: "export",
  },
  {
    title: "type_menu.utility",
    keyword: "utility",
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
  const res = new Array<Item>();

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

function isPageBottom() {
  const scrollHeight = document.documentElement.scrollHeight || document.body.scrollHeight;
  const scrollTop = document.documentElement.scrollTop || document.body.scrollTop;
  const clientHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;

  if (scrollHeight - scrollTop === clientHeight) {
    return true;
  }

  return false;
}

let autoScrollIntervalId: NodeJS.Timeout | null = null;

function clearAutoScrollInterval() {
  if (autoScrollIntervalId !== null) {
    clearInterval(autoScrollIntervalId);
  }
}

onKeyStroke("S", (_e) => {
  if (!isHiddenOptionsModal.value) {
    return;
  }

  const activeElement = document.activeElement;
  if (activeElement?.matches("input, textarea, select, [contenteditable]")) {
    return;
  }

  enableAutoScroll.value = !enableAutoScroll.value;

  if (enableAutoScroll.value === true) {
    const step = 2;
    let scrollTop = 0;
    let scrollDir: "UP" | "DOWN" = "DOWN";

    autoScrollIntervalId = setInterval(() => {
      if (scrollDir === "DOWN") {
        if (isPageBottom()) {
          scrollDir = "UP";
          reBuildRank({ force: true });
          return;
        }

        scrollTop += step;
      } else {
        if (scrollTop === 0) {
          scrollDir = "DOWN";
          reBuildRank({ force: true });
          return;
        }

        scrollTop -= step;
      }

      window.scrollTo({
        top: scrollTop,
        behavior: "smooth",
      });
    }, 64);
  } else {
    clearAutoScrollInterval();
  }
}, { dedupe: false });

const startTime = computed(() => {
  const time = rank.value.contest.getStartTime().format("YYYY-MM-DD HH:mm:ss");
  return `${t("standings.start_time")}${t("common.colon")}${time}`;
});

const endTime = computed(() => {
  const time = rank.value.contest.getEndTime().format("YYYY-MM-DD HH:mm:ss");
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

const contestState = computed(() => {
  if (rank.value.options.enableFilterSubmissionsByTimestamp) {
    return ContestState.PAUSED;
  }

  return rank.value.contest.getContestState(now.value);
});

const pausedTime = computed(() => {
  return getTimeDiff(rank.value.options.timestamp);
});

const reFetchThrottleFn = useThrottleFn(() => {
  refetch();
}, 30 * 1000);
const visibility = useDocumentVisibility();
watch(visibility, () => {
  if (visibility.value === "hidden") {
    return;
  }

  reFetchThrottleFn();
});

onUnmounted(() => {
  clearAutoScrollInterval();
});

const wrapperWidthClass = "sm:w-[1280px] xl:w-screen";
const widthClass = "sm:w-[1260px] xl:w-screen";
</script>

<template>
  <div>
    <div v-if="!firstLoaded">
      <div
        :class="[wrapperWidthClass]"
        flex flex-col gap-4
        justify-center items-center
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
      v-if="firstLoaded"
      :class="[wrapperWidthClass]"
      flex flex-col justify-center items-center
    >
      <div
        v-if="rank.contest.banner"
      >
        <div
          :class="[widthClass]"
          flex justify-center items-center
        >
          <div class="max-w-[92%]">
            <img
              :src="getImageSource(rank.contest.banner, `${DATA_HOST}${fixPath(route.path).slice(1)}`)"
              alt="banner"
            >
          </div>
        </div>
      </div>

      <div
        v-if="!rank.contest.banner || (rank.contest.banner && rank.contest.bannerMode === 'ALL')"
        class="title"
        :class="[widthClass]"
        flex justify-center
        text-center text-3xl font-normal font-serif
        mb-2
      >
        <div class="max-w-[92%]">
          {{ rank.contest.name }}
        </div>
      </div>

      <div>
        <BoardTab
          :rank="rank"
        />
      </div>

      <div
        :class="[widthClass]"
        mt-2
        flex flex-row justify-center
      >
        <div class="w-[92%]">
          <div class="flex font-bold font-mono">
            <div class="float-left">
              {{ startTime }}<sup class="pl-0.5">{{ rank.contest.getStartTime().format("z") }}</sup>
            </div>
            <div class="flex-1">
              <ContestStateBadge
                :state="contestState"
                :pending-time="rank.contest.getContestPendingTime(now)"
                :paused-time="pausedTime"
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
          class="w-[92%]"
          flex justify-center
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
            class="sm:w-full xl:w-[92%]"
          >
            <SubmissionsTable
              w-full
              :rank="rank"
              :submissions="rank.getSubmissions()"
              :enable-filter="{
                organization: true,
                team: true,
                language: true,
                status: true,
              }"
            />
          </div>

          <div
            v-if="currentType === 'statistics'"
            class="sm:w-full xl:w-[92%]"
          >
            <Statistics
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

          <div
            v-if="currentType === 'utility'"
          >
            <Utility
              :rank="rank"
            />
          </div>
        </div>
      </div>

      <div
        v-if="rankOptions.enableAnimatedSubmissions"
      >
        <AnimatedSubmissionsModal
          :rank="rank"
        />
      </div>

      <OptionsModal
        v-if="!isHiddenOptionsModal"
        v-model:is-hidden="isHiddenOptionsModal"
        v-model:rank-options="rankOptions"
        :rank="rank"
      />
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
