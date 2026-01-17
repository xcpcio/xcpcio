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

// Computed stream URLs from templates
const webcamStreamUrl = computed(() => {
  const template = props.rank.contest.options.realtimeReactionWebcamStreamUrlTemplate;
  if (!template) {
    return null;
  }
  return template.replace(/\$\{submission_id\}/, props.submissionId);
});

const screenStreamUrl = computed(() => {
  const template = props.rank.contest.options.realtimeReactionScreenStreamUrlTemplate;
  if (!template) {
    return null;
  }
  return template.replace(/\$\{submission_id\}/, props.submissionId);
});

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
