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

// const rank = computed(() => props.rank);
const team = computed(() => props.team);

const headerTitle = computed(() => {
  return `${team.value.name}`;
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
