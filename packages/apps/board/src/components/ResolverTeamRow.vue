<script setup lang="ts">
import type { ResolverVue, Team } from "@xcpcio/core";
import type { Lang } from "@xcpcio/types";

const props = defineProps<{
  index: number;
  team: Team;
  resolver: ResolverVue;
  displayRank?: number;
}>();

const index = computed(() => props.index);
const team = computed(() => props.team);
const resolver = computed(() => props.resolver);
const rank = computed(() => props.displayRank ?? team.value.rank);

const { locale } = useI18n();
const lang = computed(() => locale.value as unknown as Lang);

const isVisible = true;

function showTeamName(team: Team) {
  const sections = [team.organization?.name.getOrDefault(lang.value), team.name.getOrDefault(lang.value)];
  return sections.filter(s => s).join(" - ");
}
</script>

<template>
  <div
    h-24
  >
    <div
      v-if="isVisible"
      class="resolver-row"
      h-24
      flex flex-row gap-x-4
      font-mono text-4xl
      :class="[
        resolver.duringAnimation && resolver.currentTeamId === team.id ? 'bg-resolver-selected' : '',
        !resolver.duringAnimation && index === resolver.currentIndex ? 'bg-resolver-selected' : '',
      ]"
    >
      <div
        class="resolver-rank-cell"
        w-20
        flex flex-shrink-0 justify-center items-center
      >
        <Transition name="resolver-rank">
          <div
            :key="rank"
            class="resolver-rank-number"
          >
            {{ rank }}
          </div>
        </Transition>
      </div>

      <div
        flex flex-1 flex-row items-center gap-x-4
        min-w-0
      >
        <Badge
          v-if="team.organization?.logo"
          :image="team.organization.logo"
          class="resolver-org-logo h-20 w-20 shrink-0"
        />

        <div
          flex flex-1 flex-col justify-center items-start gap-y-3
          min-w-0
        >
          <div
            class="resolver-team-name"
            w-full
            truncate overflow-hidden
          >
            {{ showTeamName(team) }}
          </div>

          <div
            flex flex-row text-sm items-start gap-x-2
            w-full
          >
            <template
              v-for="(p, pIndex) in team.problemStatistics"
              :key="p.problem.id"
            >
              <div
                class="rounded h-7 flex flex-1 min-w-0 justify-center items-center"
                :class="[p.isAccepted ? 'bg-resolver-ac' : '',
                         p.isWrongAnswer ? 'bg-resolver-wa' : '',
                         p.isPending ? 'bg-resolver-pending' : '',
                         p.isUnSubmitted ? 'bg-resolver-untouched' : '',
                         resolver.problemFlashingEnded === false
                           && team.id === resolver.currentTeamId
                           && resolver.currentProblemIndex === pIndex
                           ? 'resolver-uncover'
                           : '',
                ]"
              >
                <template v-if="p.isAccepted">
                  {{ `${p.failedCount + Number(p.isAccepted)}/${Math.floor(p.lastSubmitTimestamp / 60)}` }}
                </template>
                <template v-if="p.isWrongAnswer">
                  {{ `${p.failedCount}/${Math.floor(p.lastSubmitTimestamp / 60)}` }}
                </template>
                <template v-if="p.isPending">
                  {{ `${p.failedCount} + ${p.pendingCount}` }}
                </template>
                <template v-if="p.isUnSubmitted">
                  {{ p.problem.label }}
                </template>
              </div>
            </template>
          </div>
        </div>
      </div>

      <div
        w-48
        flex flex-shrink-0 flex-row justify-start items-center
      >
        <div class="w-1/3 text-center">
          {{ team.solvedProblemNum }}
        </div>
        <div class="w-2/3 text-center">
          {{ team.penaltyToMinute }}
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes flashing {
  from {
    background-color: #8a6d3b;
  }

  to {
    background-color: #bd995b;
  }
}

.resolver-row {
  transition: background-color 200ms ease;
}

.resolver-rank-cell {
  position: relative;
}

.resolver-rank-number {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.resolver-rank-enter-active,
.resolver-rank-leave-active {
  transition: opacity 100ms ease;
}

.resolver-rank-enter-from,
.resolver-rank-leave-to {
  opacity: 0;
}

.resolver-uncover {
  animation: flashing 300ms infinite;
  -webkit-animation: flashing 300ms infinite; /*Safari and Chrome*/
}

.resolver-team-name {
  max-width: calc(100vw - 80px - 192px - 112px);
}

/* Scale small logos up to the box size while object-contain keeps the ratio. */
.resolver-org-logo :deep(img) {
  width: 100%;
  height: 100%;
}
</style>
