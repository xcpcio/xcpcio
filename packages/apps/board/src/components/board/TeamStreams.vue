<script setup lang="ts">
import type { Rank, Team } from "@xcpcio/core";

const props = defineProps<{
  rank: Rank;
  team: Team;
}>();

const rank = computed(() => props.rank);
const team = computed(() => props.team);

// Computed stream URLs with template replacement
const TEAM_ID_PLACEHOLDER = /\$\{team_id\}/g;
const TEAM_IP_PLACEHOLDER = /\$\{team_ip\}/;
const TEAM_IP_PLACEHOLDER_GLOBAL = /\$\{team_ip\}/g;

function buildStreamUrl(template: string | undefined, team: Team): string | null {
  if (!template) {
    return null;
  }

  if (TEAM_IP_PLACEHOLDER.test(template) && !team.ip) {
    return null;
  }

  return template
    .replace(TEAM_ID_PLACEHOLDER, team.id)
    .replace(TEAM_IP_PLACEHOLDER_GLOBAL, team.ip ?? "");
}

const webcamStreamUrl = computed(() => buildStreamUrl(rank.value.contest.options.teamWebcamStreamUrlTemplate, team.value));
const screenStreamUrl = computed(() => buildStreamUrl(rank.value.contest.options.teamScreenStreamUrlTemplate, team.value));
</script>

<template>
  <DualStreamPlayer
    :webcam-url="webcamStreamUrl"
    :screen-url="screenStreamUrl"
  />
</template>
