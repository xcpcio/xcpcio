<script setup lang="ts">
import type { Rank, Team } from "@xcpcio/core";
import Hls from "hls.js";

const props = defineProps<{
  rank: Rank;
  team: Team;
}>();

const { t } = useI18n();

const rank = computed(() => props.rank);
const team = computed(() => props.team);

// Video element refs
const webcamVideoRef = ref<HTMLVideoElement | null>(null);
const screenVideoRef = ref<HTMLVideoElement | null>(null);

// HLS instances
let webcamHls: Hls | null = null;
let screenHls: Hls | null = null;

// Error states
const webcamError = ref(false);
const screenError = ref(false);

// Computed stream URLs with template replacement
const webcamStreamUrl = computed(() => {
  const template = rank.value.contest.options.teamWebcamStreamUrlTemplate;
  if (!template) {
    return null;
  }
  return template.replace(/\$\{team_id\}/, team.value.id);
});

const screenStreamUrl = computed(() => {
  const template = rank.value.contest.options.teamScreenStreamUrlTemplate;
  if (!template) {
    return null;
  }
  return template.replace(/\$\{team_id\}/, team.value.id);
});

// Initialize HLS player
function initHlsPlayer(
  videoElement: HTMLVideoElement,
  url: string,
  onError: () => void,
): Hls | null {
  if (Hls.isSupported()) {
    const hls = new Hls({
      enableWorker: true,
      lowLatencyMode: true,
    });

    hls.loadSource(url);
    hls.attachMedia(videoElement);

    hls.on(Hls.Events.ERROR, (_event, data) => {
      if (data.fatal) {
        onError();
        hls.destroy();
      }
    });

    hls.on(Hls.Events.MANIFEST_PARSED, () => {
      videoElement.play().catch(() => {
        // Autoplay was prevented, user needs to interact
      });
    });

    return hls;
  } else if (videoElement.canPlayType("application/vnd.apple.mpegurl")) {
    // Native HLS support (Safari)
    videoElement.src = url;
    videoElement.addEventListener("error", onError);
    videoElement.play().catch(() => {});
    return null;
  }

  onError();
  return null;
}

// Cleanup function
function destroyHlsPlayers() {
  if (webcamHls) {
    webcamHls.destroy();
    webcamHls = null;
  }
  if (screenHls) {
    screenHls.destroy();
    screenHls = null;
  }
}

// Initialize players on mount
function initPlayers() {
  if (webcamVideoRef.value && webcamStreamUrl.value) {
    webcamHls = initHlsPlayer(
      webcamVideoRef.value,
      webcamStreamUrl.value,
      () => {
        webcamError.value = true;
      },
    );
  }

  if (screenVideoRef.value && screenStreamUrl.value) {
    screenHls = initHlsPlayer(
      screenVideoRef.value,
      screenStreamUrl.value,
      () => {
        screenError.value = true;
      },
    );
  }
}

onMounted(() => {
  initPlayers();
});

onBeforeUnmount(() => {
  destroyHlsPlayers();
});

// Watch for team changes to reload streams
watch(() => team.value.id, () => {
  webcamError.value = false;
  screenError.value = false;
  destroyHlsPlayers();

  nextTick(() => {
    initPlayers();
  });
});
</script>

<template>
  <div
    flex flex-col md:flex-row
    gap-4 w-full
    p-4
  >
    <!-- Webcam Stream -->
    <div
      v-if="webcamStreamUrl"
      flex-1
      flex flex-col
      items-center
    >
      <h4
        text-lg font-semibold
        text-gray-900 dark:text-white
        mb-2
      >
        {{ t("streams.webcam") }}
      </h4>
      <div
        v-if="!webcamError"
        w-full
        aspect-video
        bg-black
        rounded-lg
        overflow-hidden
      >
        <video
          ref="webcamVideoRef"
          controls
          muted
          playsinline
          class="w-full h-full object-contain"
        />
      </div>
      <div
        v-else
        w-full
        aspect-video
        bg-gray-200 dark:bg-gray-700
        rounded-lg
        flex items-center justify-center
      >
        <span text-gray-500 dark:text-gray-400>
          {{ t("streams.unavailable") }}
        </span>
      </div>
    </div>

    <!-- Screen Stream -->
    <div
      v-if="screenStreamUrl"
      flex-1
      flex flex-col
      items-center
    >
      <h4
        text-lg font-semibold
        text-gray-900 dark:text-white
        mb-2
      >
        {{ t("streams.screen") }}
      </h4>
      <div
        v-if="!screenError"
        w-full
        aspect-video
        bg-black
        rounded-lg
        overflow-hidden
      >
        <video
          ref="screenVideoRef"
          controls
          muted
          playsinline
          class="w-full h-full object-contain"
        />
      </div>
      <div
        v-else
        w-full
        aspect-video
        bg-gray-200 dark:bg-gray-700
        rounded-lg
        flex items-center justify-center
      >
        <span text-gray-500 dark:text-gray-400>
          {{ t("streams.unavailable") }}
        </span>
      </div>
    </div>
  </div>
</template>
