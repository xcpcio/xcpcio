<script setup lang="ts">
import type { Rank, Team, TeamProblemStatistics } from "@xcpcio/core";
import type { Lang } from "@xcpcio/types";

const props = defineProps<{
  isHidden: boolean;

  rank: Rank;
  team: Team;
  p: TeamProblemStatistics;
}>();

const emit = defineEmits(["update:isHidden"]);

const { locale } = useI18n();
const lang = computed(() => locale.value as unknown as Lang);

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
const teamName = computed(() => team.value.name.getOrDefault(lang.value));

const headerTitle = computed(() => {
  return `${teamName.value} - ${p.value.problem.label}`;
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
