<script setup lang="ts">
import type { Balloon, Team } from "@xcpcio/core";
import type { ThemeColor } from "@xcpcio/types";

const props = defineProps<{
  index: number;
  balloon: Balloon,
}>();

const balloon = computed(() => {
  return props.balloon;
});

const el = ref(null);
const isVisible = useElementVisibility(el);

function showTeamName(team: Team) {
  const sections = [team.location, team.organization, team.name];
  return sections.filter(s => s).join(" - ");
}

function getColor(c: ThemeColor): string {
  if (typeof c === "string") {
    return c;
  }

  if (isDark && c?.dark) {
    return c.dark;
  }

  return c.light;
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
      :class="[props.index % 2 === 0 ? 'bg-resolver-bg-zero' : 'bg-resolver-bg-one']"
    >
      <div
        w-20
        flex flex-shrink-0 justify-center items-center
        :style="{
          backgroundColor: getColor(balloon.problem!.balloonColor!.background_color),
        }"
      >
        <div
          :style="{
            color: getColor(balloon.problem!.balloonColor!.color),
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
