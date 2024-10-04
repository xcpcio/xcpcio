<script setup lang="ts">
import type { ResolverVue, Team } from "@xcpcio/core";

const props = defineProps<{
  index: number;
  team: Team;
  resolver: ResolverVue;
}>();

const index = computed(() => props.index);
const team = computed(() => props.team);
const resolver = computed(() => props.resolver);
const el = ref(null);

// TODO(Dup4): Optimizing performance with useElementVisibility
// const isVisible = useElementVisibility(el);
const isVisible = true;

function showTeamName(team: Team) {
  const sections = [team.organization, team.name];
  return sections.filter(s => s).join(" - ");
}
</script>

<template>
  <div
    ref="el"
    h-24
  >
    <div
      v-if="isVisible"
      h-24
      flex flex-row gap-x-4
      font-mono text-4xl
      :class="[index % 2 === 0 ? 'bg-resolver-bg-zero' : 'bg-resolver-bg-one',
               resolver.duringAnimation && resolver.currentTeamId === team.id ? 'bg-resolver-selected' : '',
               !resolver.duringAnimation && index === resolver.currentIndex ? 'bg-resolver-selected' : '',
      ]"
    >
      <div
        w-20
        flex flex-shrink-0 justify-center items-center
      >
        <div>
          {{ team.rank }}
        </div>
      </div>

      <div
        flex flex-1 flex-col justify-center items-start gap-y-3
      >
        <Tooltip>
          <div
            class="resolver-team-name"
            truncate overflow-hidden
          >
            {{ showTeamName(team) }}
          </div>
          <template #popper>
            <div>
              {{ showTeamName(team) }}
            </div>
          </template>
        </Tooltip>

        <div
          flex flex-row text-sm items-start gap-x-2
        >
          <template
            v-for="(p, pIndex) in team.problemStatistics"
            :key="p.problem.id"
          >
            <div
              class="rounded w-22 h-7 flex justify-center items-center"
              :class="[p.isAccepted ? 'bg-resolver-ac' : '',
                       p.isWrongAnswer ? 'bg-resolver-wa' : '',
                       p.isPending ? 'bg-resolver-pending' : '',
                       p.isUnSubmitted ? 'bg-resolver-untouched' : '',
                       resolver.problemFlashingEnded === false
                         && index === resolver.currentIndex
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

      <div
        w-48
        flex flex-shrink-0 flex-row justify-start items-center
      >
        <div class="w-1/3">
          {{ team.solvedProblemNum }}
        </div>
        <div class="w-2/3">
          {{ team.penaltyToMinute }}
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.resolver-uncover {
  animation: flashing 300ms infinite;
  -webkit-animation: flashing 30ms infinite; /*Safari and Chrome*/
}

.resolver-team-name {
  max-width: calc(100vw - 80px - 192px - 112px);
}
</style>
