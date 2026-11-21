<script setup lang="ts">
import type { SubmissionReaction } from "@xcpcio/types";

const props = defineProps<{
  isOpen: boolean;
  submissionReaction: SubmissionReaction;
  width?: string;
  hasPrevious?: boolean;
  hasNext?: boolean;
}>();

const emit = defineEmits(["close", "previous", "next"]);

const isMobileLayout = useMediaQuery("(max-width: 1023.98px)");
const videoPlayer = ref<HTMLVideoElement | null>(null);
const videoAspectRatio = ref("9 / 16");

const SWIPE_THRESHOLD = 56;

let touchStartX = 0;
let touchStartY = 0;
let touchActive = false;
let previousBodyOverflow: string | undefined;

function setPageScrollLocked(locked: boolean) {
  if (typeof document === "undefined") {
    return;
  }

  if (locked) {
    previousBodyOverflow ??= document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return;
  }

  if (previousBodyOverflow !== undefined) {
    document.body.style.overflow = previousBodyOverflow;
    previousBodyOverflow = undefined;
  }
}

watch([() => props.isOpen, isMobileLayout], ([isOpen, isMobile]) => {
  setPageScrollLocked(isOpen && isMobile);
}, { immediate: true });

onBeforeUnmount(() => {
  setPageScrollLocked(false);
});

function closeModal() {
  emit("close");
}

function closeModalOnBackgroundClick(event: MouseEvent) {
  if (event.target === event.currentTarget) {
    closeModal();
  }
}

function showPrevious() {
  if (props.hasPrevious) {
    emit("previous");
  }
}

function showNext() {
  if (props.hasNext) {
    emit("next");
  }
}

async function playVideo() {
  await nextTick();

  const player = videoPlayer.value;
  if (!player) {
    return;
  }

  try {
    await player.play();
  } catch {
    // Autoplay can be rejected; the native controls still let the user play it.
  }
}

function updateVideoAspectRatio() {
  const player = videoPlayer.value;
  if (player?.videoWidth && player.videoHeight) {
    videoAspectRatio.value = `${player.videoWidth} / ${player.videoHeight}`;
  }
}

watch(() => props.isOpen, async (newValue) => {
  if (newValue) {
    await playVideo();
  } else if (videoPlayer.value) {
    videoPlayer.value.pause();
    videoPlayer.value.currentTime = 0;
  }
});

watch(() => props.submissionReaction.url, () => {
  if (props.isOpen) {
    void playVideo();
  }
});

function onTouchStart(event: TouchEvent) {
  if (!isMobileLayout.value || event.touches.length !== 1) {
    touchActive = false;
    return;
  }

  const touch = event.touches[0];
  if (!touch) {
    touchActive = false;
    return;
  }

  touchStartX = touch.clientX;
  touchStartY = touch.clientY;
  touchActive = true;
}

function onTouchMove(event: TouchEvent) {
  if (!touchActive || event.touches.length !== 1) {
    return;
  }

  const touch = event.touches[0];
  if (!touch) {
    return;
  }

  const dx = touch.clientX - touchStartX;
  const dy = touch.clientY - touchStartY;

  // Keep the page behind the modal from scrolling while switching videos.
  if (Math.abs(dy) > 12 && Math.abs(dy) > Math.abs(dx)) {
    event.preventDefault();
  }
}

function onTouchEnd(event: TouchEvent) {
  if (!touchActive) {
    return;
  }

  touchActive = false;

  const touch = event.changedTouches[0];
  if (!touch) {
    return;
  }

  const dx = touch.clientX - touchStartX;
  const dy = touch.clientY - touchStartY;

  if (Math.abs(dy) < SWIPE_THRESHOLD || Math.abs(dy) <= Math.abs(dx)) {
    return;
  }

  if (dy < 0) {
    showNext();
  } else {
    showPrevious();
  }
}

function onTouchCancel() {
  touchActive = false;
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
      bg-white
      shadow
      relative overflow-hidden
      class="h-[100%] max-lg:h-auto max-lg:rounded-xl max-lg:bg-black max-lg:shadow-2xl max-lg:ring-1 max-lg:ring-white/15"
      :class="[width ?? 'w-full max-w-[540px]']"
      @click.stop
      @touchstart="onTouchStart"
      @touchmove="onTouchMove"
      @touchend="onTouchEnd"
      @touchcancel="onTouchCancel"
    >
      <video
        ref="videoPlayer"
        :key="submissionReaction.url"
        controls
        autoplay
        :playsinline="isMobileLayout"
        preload="metadata"
        class="w-full h-full max-lg:h-auto max-lg:max-h-[calc(100dvh-1rem)] max-lg:bg-black object-contain"
        :style="isMobileLayout ? { aspectRatio: videoAspectRatio } : undefined"
        @loadedmetadata="updateVideoAspectRatio"
      >
        <source
          :src="submissionReaction.url"
          type="video/mp4"
        >
        Your browser does not support the video tag.
      </video>

      <div
        v-if="hasPrevious || hasNext"
        class="absolute right-2 top-1/2 hidden -translate-y-1/2 flex-col gap-2 max-lg:flex"
      >
        <button
          v-if="hasPrevious"
          type="button"
          class="flex h-10 w-10 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur transition-colors hover:bg-black/70"
          aria-label="Previous reaction video"
          title="Previous reaction video"
          @click.stop="showPrevious"
          @touchstart.stop
          @touchmove.stop
          @touchend.stop
        >
          <span class="i-material-symbols-keyboard-arrow-up text-xl" />
        </button>

        <button
          v-if="hasNext"
          type="button"
          class="flex h-10 w-10 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur transition-colors hover:bg-black/70"
          aria-label="Next reaction video"
          title="Next reaction video"
          @click.stop="showNext"
          @touchstart.stop
          @touchmove.stop
          @touchend.stop
        >
          <span class="i-material-symbols-keyboard-arrow-down text-xl" />
        </button>
      </div>

      <div
        absolute top-0.5 right-0.5
        text-black
        rounded-md p-2 transition-colors duration-300 focus:outline-none
        class="max-lg:top-2 max-lg:right-2 max-lg:rounded-full max-lg:bg-black/45 max-lg:text-white max-lg:backdrop-blur"
        cursor-pointer
        @click="closeModal"
        @touchstart.stop
        @touchmove.stop
        @touchend.stop
      >
        <span
          i-ion-close-circle-outline
          text-2xl
        />
      </div>
    </div>
  </div>
</template>
