<script setup lang="ts">
import type { Rank, Team, TeamProblemStatistics } from "@xcpcio/core";
import { useMagicKeys } from "@vueuse/core";

const props = defineProps<{
  isHidden: boolean,
  rank: Rank,
  team: Team,
  p: TeamProblemStatistics,
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

function onClose() {
  isHidden.value = true;
}

const { Escape } = useMagicKeys();
watch(Escape, (v) => {
  if (v) {
    onClose();
  }
});

const rank = computed(() => props.rank);
const team = computed(() => props.team);
const p = computed(() => props.p);

const headerTitle = computed(() => {
  return `${team.value.name} - ${p.value.problem.label}`;
});
</script>

<template>
  <div
    class="md:inset-0"
    fixed z-9997
    h-screen w-screen
    overflow-x-hidden
    flex justify-center items-start
    md:mt-32 sm:mt-16
  >
    <!-- background -->
    <div
      fixed left-0 top-0 z-9998
      h-screen w-screen
      :style="{
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
      }"
      @click="onClose"
    />

    <div
      class="relative w-[78vw] p-4"
      z-9999
    >
      <div
        class="relative bg-white dark:bg-gray-800 sm:p-4"
        rounded-sm shadow-sm
      >
        <div
          class="mb-4 border-b rounded-t pb-4 sm:mb-4 dark:border-gray-600"
          flex items-center justify-between
        >
          <h3
            class="text-gray-900 dark:text-white"
            text-lg font-semibold
          >
            {{ headerTitle }}
          </h3>
          <button
            type="button"
            class="ml-auto bg-transparent p-1.5 text-sm text-gray-400 hover:bg-gray-200 hover:text-gray-900 dark:hover:bg-gray-600 dark:hover:text-white"
            items-center inline-flex rounded-lg
            @click="onClose"
          >
            <svg
              class="h-5 w-5"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fill-rule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clip-rule="evenodd"
              />
            </svg>
            <span
              sr-only
            >
              Close modal
            </span>
          </button>
        </div>

        <div
          w-full
          font-bold font-mono
          flex items-center justify-center
        >
          <SubmissionsTable
            w-full
            :rank="rank"
            :submissions="p.submissions"
            :page-size="8"
            :remove-border="true"
          />
        </div>
      </div>
    </div>
  </div>
</template>
