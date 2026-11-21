<script setup lang="ts">
import type { GiantsType, Rank, Team, TeamProblemStatistics } from "@xcpcio/core";
import type { Lang } from "@xcpcio/types";

import Badge from "@board/components/board/Badge.vue";
import {
  getAwardKey,
  getProblemColorClass,
  getProblemShow,
  getProblemSign,
} from "@board/composables/standings";
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

const showOrganization = computed(() => rank.value.contest.options.enableOrganization && !!team.value.organization);

const bigBadge = computed(() => {
  if (showOrganization.value && team.value.organization?.logo) {
    return team.value.organization.logo;
  }

  return team.value.badge;
});

const inlineTeamBadge = computed(() => {
  return !!team.value.badge && bigBadge.value !== team.value.badge ? team.value.badge : undefined;
});

const awardKey = computed(() => getAwardKey(team.value));

const cardClass = computed(() => [
  props.isFilter ? "is-filter" : "",
  props.giantsType === GiantsTypeValue.BLUE ? "is-blue" : "",
  props.giantsType === GiantsTypeValue.RED ? "is-red" : "",
]);

const el = ref<HTMLElement | null>(null);
const isVisible = useElementVisibility(el, { rootMargin: "200px 0px" });
const isRenderBody = computed(() => isVisible.value || props.ix < 24);

const problemShow = (p: TeamProblemStatistics) => getProblemShow(p, rank.value.contest.statusTimeDisplay);

function problemAriaLabel(p: TeamProblemStatistics) {
  return [p.problem.label, getProblemSign(p), problemShow(p)].filter(part => part.length > 0).join(" ");
}

function onSelectProblem(p: TeamProblemStatistics) {
  emit("selectProblem", {
    teamId: team.value.id,
    problemId: p.problem.id,
  });
}
</script>

<template>
  <article
    ref="el"
    class="standings-card min-h-[8.5rem] overflow-hidden rounded-md border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-800"
    :class="cardClass"
    data-testid="standings-card"
  >
    <div v-if="isRenderBody" class="p-3">
      <div class="flex items-start gap-2">
        <button
          type="button"
          class="rank-pill shrink-0"
          :class="awardKey ? `rank-${awardKey}` : 'rank-default'"
          :aria-label="`${t('standings.place')} ${team.rank}`"
          @click="emit('selectTeam', team.id)"
        >
          {{ team.rank }}
        </button>

        <div class="flex h-8 w-8 shrink-0 items-center justify-center rounded bg-gray-50 dark:bg-gray-700">
          <Badge :image="bigBadge" class="h-7 w-7" />
        </div>

        <div class="min-w-0 flex-1">
          <div class="flex min-w-0 items-center gap-1">
            <Badge
              v-if="inlineTeamBadge"
              :image="inlineTeamBadge"
              class="h-4 w-4 shrink-0"
            />
            <button
              type="button"
              class="min-w-0 truncate text-left text-sm font-bold"
              :aria-label="`${t('standings.team')} ${teamName}`"
              @click="emit('selectTeam', team.id)"
            >
              {{ teamName }}
            </button>
            <span v-if="team.isUnofficial" class="i-line-md:star-alt-filled shrink-0" />
            <span v-if="team.isGirl" class="i-tabler:flower-filled shrink-0" />
          </div>

          <button
            v-if="showOrganization && team.organization"
            type="button"
            class="mt-0.5 flex max-w-full items-center gap-1 truncate text-left text-[11px] leading-tight opacity-70"
            :aria-label="`${t('standings.organization')} ${team.organization.name.getOrDefault(lang)}`"
            @click="emit('selectOrg', team.organization.id)"
          >
            <span
              v-if="team.isFirstRankOfOrganization"
              class="shrink-0 font-bold"
            >
              {{ team.organization.rank }}
            </span>
            <span class="truncate">{{ team.organization.name.getOrDefault(lang) }}</span>
          </button>

          <div class="mt-0.5 truncate text-[10px] leading-tight opacity-60">
            {{ team.id }}
          </div>
        </div>

        <div class="ml-1 flex shrink-0 flex-col items-end leading-tight">
          <div class="text-lg font-bold">
            {{ team.solvedProblemNum }}
          </div>
          <div class="text-xs opacity-70">
            {{ team.penaltyToMinute }}
          </div>
        </div>
      </div>

      <div class="mt-1 text-[10px] leading-tight opacity-60">
        {{ t("standings.dirt") }} {{ team.dirt }}% · {{ t("standings.se") }} {{ team.se.toFixed(2) }}
      </div>

      <div class="mt-2 flex gap-[2px]">
        <button
          v-for="p in team.problemStatistics"
          :key="p.problem.id"
          type="button"
          class="problem-chip flex-1"
          :class="getProblemColorClass(p)"
          :aria-label="problemAriaLabel(p)"
          data-testid="problem-chip"
          :data-team-id="team.id"
          :data-problem-id="p.problem.id"
          :data-status="getProblemColorClass(p)"
          @click="onSelectProblem(p)"
        >
          <span class="chip-label">{{ p.problem.label }}</span>
        </button>
      </div>
    </div>
  </article>
</template>

<style scoped>
.standings-card.is-filter {
  border-color: #eab308;
  box-shadow: 0 0 0 1px #eab308 inset;
}

.standings-card.is-blue {
  border-left: 4px solid #60a5fa;
}

.standings-card.is-red {
  border-left: 4px solid #f87171;
}

.rank-pill {
  display: flex;
  min-width: 2.25rem;
  min-height: 2.25rem;
  align-items: center;
  justify-content: center;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  font-weight: 700;
}

.rank-default {
  background-color: var(--theme-standings-00);
  color: inherit;
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

.problem-chip {
  display: flex;
  min-height: 2rem;
  min-width: 0;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1px;
  border: 1px solid transparent;
  border-radius: 0.25rem;
  padding: 1px;
  font-size: 10px;
  line-height: 1;
}

.problem-chip.first-solve {
  background-color: var(--theme-standings-first-solve);
  color: #fff;
}

.problem-chip.correct {
  background-color: var(--theme-standings-correct);
  color: #1f2937;
}

.problem-chip.incorrect {
  background-color: var(--theme-standings-incorrect);
  color: #7f1d1d;
}

.problem-chip.pending {
  background-color: var(--theme-standings-pending);
  color: #1e3a8a;
}

.problem-chip.unattempted {
  border-color: #e5e7eb;
  background-color: var(--global-background);
  color: #9ca3af;
}

.chip-label {
  font-size: 12px;
  font-weight: 700;
}

.dark .rank-default {
  background-color: var(--theme-standings-00);
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

.dark .problem-chip.correct {
  color: #e0e0e0;
}

.dark .problem-chip.incorrect {
  color: #e0e0e0;
}

.dark .problem-chip.pending {
  color: #e0e0e0;
}

.dark .problem-chip.unattempted {
  border-color: #4b5563;
}
</style>
