<script setup lang="ts">
import type { SubmissionReaction } from "@xcpcio/types";

const props = defineProps<{
  isOpen: boolean;
  submissionReaction: SubmissionReaction;
  width?: string;
}>();

const emit = defineEmits(["close"]);

const videoPlayer = ref<HTMLVideoElement | null>(null);

function closeModal() {
  emit("close");
}

function closeModalOnBackgroundClick(event: MouseEvent) {
  if (event.target === event.currentTarget) {
    closeModal();
  }
}

watch(() => props.isOpen, (newValue) => {
  if (newValue && videoPlayer.value) {
    videoPlayer.value.play();
  } else if (videoPlayer.value) {
    videoPlayer.value.pause();
    videoPlayer.value.currentTime = 0;
  }
});
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
      bg-white
      shadow
      relative overflow-hidden
      class="h-[100%]"
      :class="[width ?? 'w-[540px]']"
      @click.stop
    >
      <video
        ref="videoPlayer"
        controls autoplay
        class="w-full h-full"
      >
        <source
          :src="submissionReaction.url"
          type="video/mp4"
        >
        Your browser does not support the video tag.
      </video>
      <div
        absolute top-0.5 right-0.5
        text-black
        rounded-md p-2 transition-colors duration-300 focus:outline-none
        cursor-pointer
        @click="closeModal"
      >
        <span
          i-ion-close-circle-outline
          text-2xl
        />
      </div>
    </div>
  </div>
</template>
