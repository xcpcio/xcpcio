<script setup lang="ts">
import type { Rank, Team, TeamProblemStatistics } from "@xcpcio/core";

const props = defineProps<{
  isHidden: boolean;

  rank: Rank;
  team: Team;
  p: TeamProblemStatistics;
}>();

const emit = defineEmits(["update:isHidden"]);

const isHidden = computed({
  get() {
    return props.isHidden;
  },
  set(value) {
    emit("update:isHidden", value);
  },
});

const rank = computed(() => props.rank);
const team = computed(() => props.team);
const p = computed(() => props.p);

const headerTitle = computed(() => {
  return `${team.value.name} - ${p.value.problem.label}`;
});
</script>

<template>
  <Modal
    v-model:is-hidden="isHidden"
    :title="headerTitle"
  >
    <div
      w-full
      font-bold font-mono
      flex items-center justify-center
      class="mt-[-12px]"
    >
      <SubmissionsTable
        w-full
        :rank="rank"
        :submissions="p.submissions"
        :page-size="8"
        :remove-border="true"
      />
    </div>
  </Modal>
</template>
