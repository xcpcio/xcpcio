<script setup lang="ts">
import type { GiantTeam } from "@board/composables/useStandingsLists";
import type { GiantsType, Rank, Team, Teams } from "@xcpcio/core";

import { isBoardMenuButtonVisible } from "@board/composables/boardMenuButton";

const props = defineProps<{
  rank: Rank;
  teams: Teams;
  filterTeams: Teams;
  giantTeams: GiantTeam[];
}>();

interface TableRow {
  key: string;
  team: Team;
  ix: number;
  isFilter?: boolean;
  giantsType?: GiantsType;
}

const { t } = useI18n();
const rank = computed(() => props.rank);

const scroller = ref<HTMLElement | null>(null);
const headerScroller = ref<HTMLElement | null>(null);
const { width: scrollerWidth } = useElementSize(scroller);

const PLACE_COLUMN_WIDTH = 36;
const SOLVED_COLUMN_WIDTH = 36;
const PENALTY_COLUMN_WIDTH = 56;
const PROBLEM_COLUMN_WIDTH = 48;
const DIRT_COLUMN_WIDTH = 40;
const SE_COLUMN_WIDTH = 40;
const TEAM_MIN_COLUMN_WIDTH = 104;
const TEAM_MAX_COLUMN_WIDTH = 224;
// Keep roughly two problem columns visible next to the frozen columns.
const VISIBLE_PROBLEM_COLUMNS = 2.1;

const teamColumnWidth = computed(() => {
  const reserved = PLACE_COLUMN_WIDTH
    + SOLVED_COLUMN_WIDTH
    + PENALTY_COLUMN_WIDTH
    + PROBLEM_COLUMN_WIDTH * VISIBLE_PROBLEM_COLUMNS;

  if (scrollerWidth.value <= 0) {
    return TEAM_MIN_COLUMN_WIDTH;
  }

  return Math.round(Math.min(
    TEAM_MAX_COLUMN_WIDTH,
    Math.max(TEAM_MIN_COLUMN_WIDTH, scrollerWidth.value - reserved),
  ));
});

const problemCount = computed(() => rank.value.contest.problems.length);

const columnWidths = computed<number[]>(() => {
  const widths = new Array<number>(problemCount.value).fill(PROBLEM_COLUMN_WIDTH);

  return [
    PLACE_COLUMN_WIDTH,
    teamColumnWidth.value,
    SOLVED_COLUMN_WIDTH,
    PENALTY_COLUMN_WIDTH,
    ...widths,
    DIRT_COLUMN_WIDTH,
    SE_COLUMN_WIDTH,
  ];
});

const tableWidth = computed(() => columnWidths.value.reduce((sum, width) => sum + width, 0));

const tableStyle = computed<Record<string, string>>(() => ({
  "width": `${tableWidth.value}px`,
  "--m-place-w": `${PLACE_COLUMN_WIDTH}px`,
  "--m-team-w": `${teamColumnWidth.value}px`,
  "--m-solved-w": `${SOLVED_COLUMN_WIDTH}px`,
}));

function syncHeaderScroll() {
  const body = scroller.value;
  const header = headerScroller.value;

  if (body && header && header.scrollLeft !== body.scrollLeft) {
    header.scrollLeft = body.scrollLeft;
  }
}

const rows = computed<TableRow[]>(() => {
  const result: TableRow[] = [];
  let ix = 0;

  for (const giantTeam of props.giantTeams) {
    result.push({
      key: `giant-${giantTeam.team.id}`,
      team: giantTeam.team,
      ix: ix++,
      giantsType: giantTeam.giantsType,
    });
  }

  for (const team of props.filterTeams) {
    result.push({
      key: `filter-${team.id}`,
      team,
      ix: ix++,
      isFilter: true,
    });
  }

  for (const team of props.teams) {
    result.push({
      key: `team-${team.id}`,
      team,
      ix: ix++,
    });
  }

  return result;
});
</script>

<template>
  <div
    class="standings-mobile-table w-full"
    :class="{ 'is-menu-visible': isBoardMenuButtonVisible }"
    data-testid="standings-mobile-table"
  >
    <div class="standings-mobile-sticky-header">
      <div
        ref="headerScroller"
        class="standings-mobile-header-scroller"
      >
        <table
          class="standings mobile-standings-table"
          font-mono dark:text-gray-200
          :style="tableStyle"
        >
          <colgroup>
            <col
              v-for="(width, index) in columnWidths"
              :key="`header-col-${index}`"
              :style="{ width: `${width}px` }"
            >
          </colgroup>

          <thead>
            <tr>
              <th class="title m-sticky m-place">
                {{ t("standings.place") }}
              </th>
              <th class="title m-sticky m-team">
                {{ t("standings.team") }}
              </th>
              <th class="title m-sticky m-solved">
                {{ t("standings.solved") }}
              </th>
              <th class="title m-sticky m-penalty">
                {{ t("standings.penalty") }}
              </th>

              <ProblemBlock
                v-for="p in rank.contest.problems"
                :key="`problem-block-${p.id}`"
                :rank="rank"
                :problem="p"
              />

              <th class="title">
                <Tooltip placement="top">
                  <div>
                    {{ t("standings.dirt") }}
                  </div>

                  <template #popper>
                    <div>
                      number of submits on the
                      <br>
                      all solved problems / number
                      <br>
                      of the solved problems
                    </div>
                  </template>
                </Tooltip>
              </th>

              <th class="title">
                <Tooltip placement="top">
                  <div>
                    {{ t("standings.se") }}
                  </div>

                  <template #popper>
                    <div>
                      "average hardness".
                      <br>
                      Problem, solved by N teams out of M,
                      <br>
                      have hardness (M-N)/M.
                    </div>
                  </template>
                </Tooltip>
              </th>
            </tr>
          </thead>
        </table>
      </div>
    </div>

    <div
      ref="scroller"
      class="standings-mobile-scroller w-full overflow-x-auto overscroll-x-contain"
      @scroll.passive="syncHeaderScroll"
    >
      <table
        class="standings mobile-standings-table"
        font-mono dark:text-gray-200
        :style="tableStyle"
      >
        <colgroup>
          <col
            v-for="(width, index) in columnWidths"
            :key="`body-col-${index}`"
            :style="{ width: `${width}px` }"
          >
        </colgroup>

        <tbody>
          <TeamUI
            v-for="row in rows"
            :key="row.key"
            :ix="row.ix"
            :rank="rank"
            :team="row.team"
            :is-filter="row.isFilter"
            :giants-type="row.giantsType"
            :is-compact-layout="true"
            :is-sticky-layout="true"
          />
        </tbody>
      </table>
    </div>
  </div>
</template>

<style scoped>
.standings-mobile-sticky-header {
  position: sticky;
  top: 0;
  z-index: 40;
  width: 100%;
  overflow: hidden;
  background: var(--global-background);
  transition: top 0.2s ease;
}

.standings-mobile-table.is-menu-visible .standings-mobile-sticky-header {
  top: 3.5rem;
}

.standings-mobile-header-scroller {
  width: 100%;
  overflow: hidden;
}

.standings-mobile-table .mobile-standings-table {
  table-layout: fixed;
  border-spacing: 0 2px !important;
  margin: 0 !important;
}

.standings-mobile-table .mobile-standings-table :deep(th),
.standings-mobile-table .mobile-standings-table :deep(td) {
  box-sizing: border-box !important;
}

.standings-mobile-table :deep(.m-sticky) {
  position: sticky;
  z-index: 20;
}

.standings-mobile-table :deep(.m-place) {
  left: 0;
}

.standings-mobile-table :deep(.m-team) {
  left: var(--m-place-w);
}

.standings-mobile-table :deep(.m-solved) {
  left: calc(var(--m-place-w) + var(--m-team-w));
}

.standings-mobile-table :deep(.m-penalty) {
  left: calc(var(--m-place-w) + var(--m-team-w) + var(--m-solved-w));
}

.standings-mobile-table .mobile-standings-table :deep(th.title) {
  padding: 0 !important;
  background-color: #f5f5d5;
  font-size: 10px;
  font-weight: 700;
}

.dark .standings-mobile-table .mobile-standings-table :deep(th.title) {
  background-color: #3d3d50;
  color: #e0e0e0;
}

.standings-mobile-table .mobile-standings-table :deep(td.stnd) {
  font-size: 12px;
}

.standings-mobile-table :deep(tr.filter-team td.m-sticky) {
  background-color: lightyellow;
}

.dark .standings-mobile-table :deep(tr.filter-team td.m-sticky) {
  background-color: #4a6080;
}

.standings-mobile-scroller {
  position: relative;
  -webkit-overflow-scrolling: touch;
}
</style>
