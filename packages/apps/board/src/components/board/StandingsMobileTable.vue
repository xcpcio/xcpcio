<script setup lang="ts">
import type { GiantTeam } from "@board/composables/useStandingsLists";
import type { GiantsType, Rank, Team, Teams } from "@xcpcio/core";

import type { Lang } from "@xcpcio/types";
import ProblemInfoModal from "@board/components/board/ProblemInfoModal.vue";

const props = defineProps<{
  rank: Rank;
  teams: Teams;
  filterTeams: Teams;
  giantTeams: GiantTeam[];
}>();

const emit = defineEmits<{
  (event: "selectTeam", teamId: string): void;
  (event: "selectOrg", organizationId: string): void;
  (event: "selectProblem", payload: { teamId: string; problemId: string }): void;
}>();

interface TableRow {
  key: string;
  team: Team;
  ix: number;
  isFilter?: boolean;
  giantsType?: GiantsType;
}

const { t, locale } = useI18n();
const lang = computed(() => locale.value as unknown as Lang);
const rank = computed(() => props.rank);
const selectedProblemId = ref<string | null>(null);
const selectedProblem = computed(() => {
  return selectedProblemId.value ? rank.value.contest.problemsMap.get(selectedProblemId.value) : undefined;
});
const scroller = ref<HTMLElement | null>(null);
const headerScroller = ref<HTMLElement | null>(null);
const { width: scrollerWidth } = useElementSize(scroller);

function syncHeaderScroll() {
  const body = scroller.value;
  const header = headerScroller.value;

  if (body && header && header.scrollLeft !== body.scrollLeft) {
    header.scrollLeft = body.scrollLeft;
  }
}

const viewportStyle = computed(() => {
  return scrollerWidth.value > 0
    ? { "--standings-mobile-width": `${scrollerWidth.value}px` }
    : {};
});

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

function getProblemHeaderStyle(problemIndex: number) {
  const problem = rank.value.contest.problems[problemIndex];
  return {
    backgroundColor: problem.balloonColor.background_color,
    color: problem.balloonColor.color,
  };
}
</script>

<template>
  <div
    class="standings-mobile-table w-full"
    data-testid="standings-mobile-table"
  >
    <div class="standings-mobile-sticky-header">
      <div
        ref="headerScroller"
        class="overflow-hidden"
      >
        <div class="min-w-max">
          <div class="standings-mobile-header">
            <div class="standings-mobile-header-stats">
              <div class="standings-mobile-header-place">
                {{ t("standings.place") }}
              </div>
              <div class="standings-mobile-header-solved">
                {{ t("standings.solved") }}
              </div>
              <div class="standings-mobile-header-penalty">
                {{ t("standings.penalty") }}
              </div>
            </div>

            <button
              v-for="(problem, problemIndex) in rank.contest.problems"
              :key="problem.id"
              type="button"
              class="standings-mobile-problem-header"
              :style="getProblemHeaderStyle(problemIndex)"
              :title="problem.name?.getOrDefault(lang) ?? problem.label"
              :aria-label="problem.name?.getOrDefault(lang) ?? problem.label"
              @click="selectedProblemId = problem.id"
            >
              <span class="standings-mobile-problem-header-label">{{ problem.label }}</span>
              <span class="standings-mobile-problem-header-count">{{ problem.statistics.acceptedNum }}</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <div
      ref="scroller"
      class="standings-mobile-scroller w-full overflow-x-auto overscroll-x-contain"
      :style="viewportStyle"
      @scroll.passive="syncHeaderScroll"
    >
      <div class="min-w-max">
        <StandingsMobileRow
          v-for="row in rows"
          :key="row.key"
          :rank="rank"
          :team="row.team"
          :ix="row.ix"
          :is-filter="row.isFilter"
          :giants-type="row.giantsType"
          @select-team="emit('selectTeam', $event)"
          @select-org="emit('selectOrg', $event)"
          @select-problem="emit('selectProblem', $event)"
        />
      </div>
    </div>

    <ProblemInfoModal
      v-if="selectedProblem"
      :key="selectedProblem.id"
      :is-hidden="false"
      :rank="rank"
      :problem="selectedProblem"
      @update:is-hidden="selectedProblemId = null"
    />
  </div>
</template>

<style scoped>
.standings-mobile-sticky-header {
  position: sticky;
  top: 3.5rem;
  z-index: 40;
  width: 100%;
  overflow: hidden;
  background: #f9fafb;
}

.standings-mobile-header {
  display: flex;
  height: 30px;
  align-items: stretch;
  border-bottom: 1px solid #e5e7eb;
  background: #f9fafb;
}

.standings-mobile-header-stats {
  position: sticky;
  left: 0;
  z-index: 30;
  display: flex;
  width: 118px;
  flex: 0 0 118px;
  height: 100%;
  align-items: center;
  background: #f9fafb;
}

.standings-mobile-header-place {
  width: 36px;
  flex: 0 0 36px;
  text-align: center;
  font-size: 9px;
  font-weight: 700;
}

.standings-mobile-header-solved {
  width: 38px;
  flex: 0 0 38px;
  text-align: center;
  font-size: 9px;
  font-weight: 700;
}

.standings-mobile-header-penalty {
  width: 44px;
  flex: 0 0 44px;
  text-align: center;
  font-size: 9px;
  font-weight: 700;
}

.standings-mobile-problem-header {
  display: flex;
  width: 46px;
  flex: 0 0 46px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border: 0;
  border-radius: 0;
  padding: 0;
  line-height: 1;
  cursor: pointer;
}

.standings-mobile-problem-header-label {
  font-size: 11px;
  font-weight: 700;
}

.standings-mobile-problem-header-count {
  margin-top: 2px;
  font-size: 9px;
  opacity: 0.8;
}

.standings-mobile-scroller {
  position: relative;
  -webkit-overflow-scrolling: touch;
}

.dark .standings-mobile-sticky-header,
.dark .standings-mobile-header,
.dark .standings-mobile-header-stats {
  border-color: #374151;
  background: #374151;
}
</style>
