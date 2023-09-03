<script setup lang="ts">
import type { Rank, Team, TeamProblemStatistics } from "@xcpcio/core";
import { useMagicKeys } from "@vueuse/core";

const props = defineProps<{
  hidden: boolean,
  rank: Rank,
  team: Team,
  p: TeamProblemStatistics,
}>();

const emit = defineEmits(["update:hidden"]);

const rank = reactive(props.rank);
const team = reactive(props.team);
const p = reactive(props.p);

const isHidden = computed({
  get() {
    return props.hidden;
  },
  set(value) {
    emit("update:hidden", value);
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

const headerTitle = computed(() => {
  return `${team.name} - ${p.problem.label}`;
});
</script>

<template>
  <div
    class="overflow-x-hidden fixed flex justify-center w-full h-full md:inset-0 h-modal items-start mt-4"
    z-9997
  >
    <!-- background -->
    <div
      class="fixed top-0 left-0 w-screen h-screen"
      z-9998
      :style="{
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
      }"
      @click="onClose"
    />

    <div
      class="relative p-4 w-full md:max-w-[92vw]"
      z-9999
    >
      <!-- Modal content -->
      <div
        class="relative p-4 bg-white shadow dark:bg-gray-800 sm:p-5 rounded-sm"
      >
        <!-- Modal header -->
        <div class="flex justify-between items-center pb-4 mb-4 rounded-t border-b sm:mb-5 dark:border-gray-600">
          <h3 class="text-lg font-semibold text-gray-900 dark:text-white">
            {{ headerTitle }}
          </h3>
          <button
            type="button"
            class="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center dark:hover:bg-gray-600 dark:hover:text-white"
            @click="onClose"
          >
            <svg
              class="w-5 h-5"
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
            <span class="sr-only">
              Close modal
            </span>
          </button>
        </div>

        <div class="flex justify-center items-center">
          <SubmissionsTable
            :rank="rank"
            :submissions="p.submissions"
            :page-size="8"
          />
        </div>
      </div>
    </div>
  </div>
</template>
