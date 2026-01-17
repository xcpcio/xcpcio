<script setup lang="ts">
import type { Rank, Team } from "@xcpcio/core";

const props = defineProps<{
  rank: Rank;
  team: Team;
}>();

const rank = computed(() => props.rank);
const team = computed(() => props.team);

// Computed stream URLs with template replacement
const webcamStreamUrl = computed(() => {
  const template = rank.value.contest.options.teamWebcamStreamUrlTemplate;
  if (!template) {
    return null;
  }
  return template.replace(/\$\{team_id\}/, team.value.id);
});

const screenStreamUrl = computed(() => {
  const template = rank.value.contest.options.teamScreenStreamUrlTemplate;
  if (!template) {
    return null;
  }
  return template.replace(/\$\{team_id\}/, team.value.id);
});
</script>

<template>
  <DualStreamPlayer
    :webcam-url="webcamStreamUrl"
    :screen-url="screenStreamUrl"
  />
</template>
