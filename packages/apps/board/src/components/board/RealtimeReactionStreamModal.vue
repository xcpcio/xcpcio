<script setup lang="ts">
import type { Rank } from "@xcpcio/core";

import { useModalStack } from "@board/composables/useModalStack";

const props = defineProps<{
  isOpen: boolean;
  submissionId: string;
  rank: Rank;
  width?: string;
}>();

const emit = defineEmits(["close"]);

const { t } = useI18n();
const { Escape } = useMagicKeys();
const { register, unregister, isTopModal } = useModalStack();

// Modal stack registration
watch(() => props.isOpen, (newValue) => {
  if (newValue) {
    register();
  } else {
    unregister();
  }
}, { immediate: true });

// ESC key handling - only close if this is the top modal
watch(Escape, (v) => {
  if (v && props.isOpen && isTopModal()) {
    closeModal();
  }
});

onBeforeUnmount(() => {
  unregister();
});

const DEFAULT_REACTION_START_OFFSET_SECONDS = -5;

const TEAM_IP_PLACEHOLDER = /\$\{team_ip\}/;
const SUBMIT_TIME_PLACEHOLDER = /\$\{submit_time\}/;
const REACTION_START_TIME_PLACEHOLDER = /\$\{reaction_start_time(?::-?\d+)?\}/;
const REACTION_START_TIME_PLACEHOLDER_GLOBAL = /\$\{reaction_start_time(?::(-?\d+))?\}/g;

const submission = computed(() => props.rank.submissionsMap.get(props.submissionId));
const team = computed(() => {
  if (!submission.value) {
    return undefined;
  }

  return props.rank.teamsMap.get(submission.value.teamId);
});

function formatStreamTime(offsetSeconds: number): string {
  if (!submission.value) {
    return "";
  }

  return props.rank.contest.startTime
    .add(submission.value.timestampToSecond + offsetSeconds, "second")
    .format("YYYY-MM-DDTHH:mm:ssZ");
}

const submitTime = computed(() => formatStreamTime(0));

function buildStreamUrl(template: string | undefined): string | null {
  if (!template) {
    return null;
  }

  if (TEAM_IP_PLACEHOLDER.test(template) && !team.value?.ip) {
    return null;
  }

  if ((SUBMIT_TIME_PLACEHOLDER.test(template) || REACTION_START_TIME_PLACEHOLDER.test(template)) && !submission.value) {
    return null;
  }

  return template
    .replace(/\$\{submission_id\}/g, props.submissionId)
    .replace(/\$\{team_id\}/g, submission.value?.teamId ?? "")
    .replace(/\$\{team_ip\}/g, team.value?.ip ?? "")
    .replace(/\$\{problem_id\}/g, submission.value?.problemId ?? "")
    .replace(/\$\{submit_time\}/g, encodeURIComponent(submitTime.value))
    .replace(REACTION_START_TIME_PLACEHOLDER_GLOBAL, (_match: string, offset?: string) => {
      const offsetSeconds = offset === undefined ? DEFAULT_REACTION_START_OFFSET_SECONDS : Number(offset);
      return encodeURIComponent(formatStreamTime(offsetSeconds));
    });
}

// Computed stream URLs from templates
const webcamStreamUrl = computed(() => buildStreamUrl(props.rank.contest.options.realtimeReactionWebcamStreamUrlTemplate));
const screenStreamUrl = computed(() => buildStreamUrl(props.rank.contest.options.realtimeReactionScreenStreamUrlTemplate));

function closeModal() {
  emit("close");
}

function closeModalOnBackgroundClick(event: MouseEvent) {
  if (event.target === event.currentTarget) {
    closeModal();
  }
}
</script>

<template>
  <div
    v-if="isOpen"
    fixed inset-0 flex items-center justify-center
    p-2 bg-black bg-opacity-50
    z-2999
    @click="closeModalOnBackgroundClick"
  >
    <div
      bg-white dark:bg-gray-800
      shadow rounded-lg
      relative overflow-hidden
      flex flex-col
      class="max-h-[90vh]"
      :class="[width ?? 'w-[80vw] max-w-[1200px]']"
      @click.stop
    >
      <!-- Header -->
      <div
        flex items-center justify-between
        px-4 py-3
        border-b border-gray-200 dark:border-gray-700
      >
        <h3 text-lg font-semibold text-gray-900 dark:text-white>
          {{ t("streams.realtime_reaction") }} #{{ submissionId }}
        </h3>
        <button
          text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200
          cursor-pointer
          @click="closeModal"
        >
          <span i-ion-close-circle-outline text-2xl />
        </button>
      </div>

      <!-- Content -->
      <div
        flex-1
        overflow-auto
        p-4
      >
        <DualStreamPlayer
          :webcam-url="webcamStreamUrl"
          :screen-url="screenStreamUrl"
        />
      </div>
    </div>
  </div>
</template>
