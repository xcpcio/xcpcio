<script setup lang="ts">
import type { Rank, Team } from "@xcpcio/core";

const props = defineProps<{
  isHidden: boolean,

  rank: Rank,
  team: Team,
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

const headerTitle = computed(() => {
  let res = "";

  if (rank.value.contest.organization && team.value.organization.length > 0) {
    res += `${team.value.organization} - `;
  }

  res += `${team.value.name}`;

  if (team.value.members) {
    res += ` - ${team.value.members}`;
  }

  if (team.value.coach) {
    res += ` - ${team.value.coach}(coach)`;
  }

  return res;
});
</script>

<template>
  <Modal
    v-model:isHidden="isHidden"
    :title="headerTitle"
  >
    <div
      w-full
      font-bold font-mono
      flex items-center justify-center
    >
      <SubmissionsTable
        w-full
        :rank="rank"
        :submissions="team.submissions"
        :page-size="8"
        :remove-border="true"
      />
    </div>
  </Modal>
</template>
