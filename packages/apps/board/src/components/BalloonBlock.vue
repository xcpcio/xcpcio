<script setup lang="ts">
import type { Balloon, Team } from "@xcpcio/core";
import type { Lang } from "@xcpcio/types";

const props = defineProps<{
  index: number;
  balloon: Balloon;
}>();

const index = computed(() => props.index);
const balloon = computed(() => props.balloon);

const el = ref(null);
const isVisible = useElementVisibility(el);

const { locale } = useI18n();
const lang = computed(() => locale.value as unknown as Lang);

function showTeamName(team: Team) {
  const sections = [team.location, team.organization, team.name.getOrDefault(lang.value)];
  return sections.filter(s => s).join(" - ");
}

const balloonColor = computed(() => balloon.value.problem.balloonColor);
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
      :class="[index % 2 === 0 ? 'bg-resolver-bg-0' : 'bg-resolver-bg-1']"
    >
      <div
        w-20
        flex flex-shrink-0 justify-center items-center
        :style="{
          backgroundColor: balloonColor.background_color,
        }"
      >
        <div
          :style="{
            color: balloonColor.color,
          }"
        >
          {{ balloon.problem.label }}
        </div>
      </div>

      <div
        flex flex-1 flex-col justify-center items-start
      >
        <div
          class="resolver-team-name"
          truncate overflow-hidden
        >
          {{ showTeamName(balloon.team) }}
        </div>
        <div
          flex flex-row text-sm items-start gap-x-2
        />
      </div>

      <div
        w-32
        flex flex-shrink-0 flex-row justify-start items-center
      >
        {{ balloon.submission.timestampToMinute }}
      </div>
    </div>
  </div>
</template>
