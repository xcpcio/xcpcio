<script setup lang="ts">
import type { GiantsType, Rank, Team, TeamProblemStatistics } from "@xcpcio/core";
import type { Lang } from "@xcpcio/types";

import Badge from "@board/components/board/Badge.vue";
import { getAwardKey, getProblemColorClass, getProblemShow, getProblemSign } from "@board/composables/standings";
import { useElementVisibility } from "@vueuse/core";
import { GiantsType as GiantsTypeValue } from "@xcpcio/core";

const props = defineProps<{
  rank: Rank;
  team: Team;
  ix: number;
  isFilter?: boolean;
  giantsType?: GiantsType;
}>();

const emit = defineEmits<{
  (event: "selectTeam", teamId: string): void;
  (event: "selectOrg", organizationId: string): void;
  (event: "selectProblem", payload: { teamId: string; problemId: string }): void;
}>();

const { t, locale } = useI18n();
const lang = computed(() => locale.value as unknown as Lang);

const rank = computed(() => props.rank);
const team = computed(() => props.team);
const teamName = computed(() => team.value.name.getOrDefault(lang.value));
const organizationName = computed(() => team.value.organization?.name.getOrDefault(lang.value));
const badge = computed(() => team.value.organization?.logo ?? team.value.badge);
const showOrganization = computed(() => rank.value.contest.options.enableOrganization && !!team.value.organization);
const awardKey = computed(() => getAwardKey(team.value));

const el = ref<HTMLElement | null>(null);
const isVisible = useElementVisibility(el, { rootMargin: "300px 0px" });
const isRenderBody = computed(() => isVisible.value || props.ix < 24);

function problemAriaLabel(p: TeamProblemStatistics) {
  return [p.problem.label, getProblemSign(p), getProblemShow(p, rank.value.contest.statusTimeDisplay)].filter(part => part.length > 0).join(" ");
}

function onSelectProblem(p: TeamProblemStatistics) {
  emit("selectProblem", {
    teamId: team.value.id,
    problemId: p.problem.id,
  });
}
</script>

<template>
  <div
    ref="el"
    class="mobile-standings-row"
    :class="{
      'is-filter': isFilter,
      'is-blue': giantsType === GiantsTypeValue.BLUE,
      'is-red': giantsType === GiantsTypeValue.RED,
    }"
    data-testid="standings-row"
  >
    <template v-if="isRenderBody">
      <div class="mobile-team-line">
        <Badge
          v-if="badge"
          :image="badge"
          class="h-4 w-4 shrink-0"
        />

        <button
          v-if="showOrganization && organizationName"
          type="button"
          class="max-w-[34%] shrink-0 truncate text-left text-[11px] opacity-70"
          :aria-label="`${t('standings.organization')} ${organizationName}`"
          @click="emit('selectOrg', team.organization!.id)"
        >
          {{ organizationName }}
        </button>
        <span
          v-if="showOrganization && organizationName"
          class="shrink-0 text-[9px] opacity-30"
        >
          |
        </span>

        <button
          type="button"
          class="min-w-0 flex-1 truncate text-left text-xs font-bold"
          :aria-label="`${t('standings.team')} ${teamName}`"
          @click="emit('selectTeam', team.id)"
        >
          {{ teamName }}
        </button>

        <span v-if="team.isUnofficial" class="i-line-md:star-alt-filled shrink-0" />
        <span v-if="team.isGirl" class="i-tabler:flower-filled shrink-0" />

        <span class="shrink-0 text-[9px] opacity-50">
          {{ t("standings.dirt") }} {{ team.dirt }}% · {{ t("standings.se") }} {{ team.se.toFixed(2) }}
        </span>
      </div>

      <div class="mobile-stats-line">
        <div class="mobile-stats">
          <button
            type="button"
            class="mobile-rank"
            :class="awardKey ? `rank-${awardKey}` : 'rank-default'"
            :aria-label="`${t('standings.place')} ${team.rank}`"
            @click="emit('selectTeam', team.id)"
          >
            {{ team.rank }}
          </button>
          <div class="mobile-solved">
            {{ team.solvedProblemNum }}
          </div>
          <div class="mobile-penalty">
            {{ team.penaltyToMinute }}
          </div>
        </div>

        <div class="flex">
          <button
            v-for="p in team.problemStatistics"
            :key="p.problem.id"
            type="button"
            class="mobile-problem"
            :class="getProblemColorClass(p)"
            :aria-label="problemAriaLabel(p)"
            data-testid="problem-chip"
            :data-team-id="team.id"
            :data-problem-id="p.problem.id"
            :data-status="getProblemColorClass(p)"
            @click="onSelectProblem(p)"
          >
            <span class="mobile-problem-sign">{{ getProblemSign(p) }}</span>
            <span class="mobile-problem-show">{{ getProblemShow(p, rank.contest.statusTimeDisplay) }}</span>
          </button>
        </div>
      </div>
    </template>

    <div v-else class="mobile-row-placeholder" />
  </div>
</template>

<style scoped>
.mobile-standings-row {
  border-bottom: 1px solid #e5e7eb;
}

.dark .mobile-standings-row {
  border-color: #374151;
}

.mobile-team-line {
  position: sticky;
  left: 0;
  z-index: 20;
  display: flex;
  width: var(--standings-mobile-width, 100%);
  height: 1.5rem;
  align-items: center;
  gap: 0.375rem;
  padding: 0 0.5rem;
  background: var(--global-background);
}

.mobile-stats-line {
  display: flex;
  height: 2.125rem;
}

.mobile-stats {
  position: sticky;
  left: 0;
  z-index: 20;
  display: flex;
  width: 118px;
  flex: 0 0 118px;
  height: 100%;
  background: var(--global-background);
}

.mobile-rank {
  display: flex;
  width: 36px;
  flex: 0 0 36px;
  height: 100%;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
}

.rank-default {
  background-color: var(--theme-standings-00);
}

.rank-gold {
  background-color: #fff566;
  color: #000;
}

.rank-silver {
  background-color: #ffadd2;
  color: #000;
}

.rank-bronze {
  background-color: #f0c0a0;
  color: #000;
}

.rank-honorable {
  background-color: #e6f7ff;
  color: #000;
}

.mobile-solved {
  display: flex;
  width: 38px;
  flex: 0 0 38px;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
}

.mobile-penalty {
  display: flex;
  width: 44px;
  flex: 0 0 44px;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 600;
}

.mobile-problem {
  display: flex;
  width: 46px;
  height: 34px;
  flex: 0 0 46px;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border: 2px solid var(--global-background);
  border-radius: 4px;
  line-height: 1;
}

.mobile-problem-sign {
  font-size: 10px;
  font-weight: 700;
}

.mobile-problem-show {
  margin-top: 2px;
  font-size: 9px;
}

.mobile-problem.first-solve {
  background-color: var(--theme-standings-first-solve);
  color: #fff;
}

.mobile-problem.correct {
  background-color: var(--theme-standings-correct);
  color: #1f2937;
}

.mobile-problem.incorrect {
  background-color: var(--theme-standings-incorrect);
  color: #7f1d1d;
}

.mobile-problem.pending {
  background-color: var(--theme-standings-pending);
  color: #1e3a8a;
}

.mobile-problem.unattempted {
  color: transparent;
}

.dark .rank-gold {
  background-color: #d4b830;
  color: #fff;
}

.dark .rank-silver {
  background-color: #a07090;
  color: #fff;
}

.dark .rank-bronze {
  background-color: #b08060;
  color: #fff;
}

.dark .rank-honorable {
  background-color: #2d4a5c;
  color: #fff;
}

.dark .mobile-problem.correct,
.dark .mobile-problem.incorrect,
.dark .mobile-problem.pending {
  color: #e0e0e0;
}

.mobile-standings-row.is-filter .mobile-team-line,
.mobile-standings-row.is-filter .mobile-stats {
  background-color: #fef9c3;
}

.dark .mobile-standings-row.is-filter .mobile-team-line,
.dark .mobile-standings-row.is-filter .mobile-stats {
  background-color: #3f3a18;
}

.mobile-standings-row.is-blue .mobile-team-line {
  border-left: 3px solid #60a5fa;
}

.mobile-standings-row.is-red .mobile-team-line {
  border-left: 3px solid #f87171;
}

.mobile-row-placeholder {
  height: 58px;
}
</style>
