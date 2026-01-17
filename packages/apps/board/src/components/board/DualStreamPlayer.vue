<script setup lang="ts">
import type Hls from "hls.js";

import { useHlsPlayer } from "@board/composables/useHlsPlayer";

const props = defineProps<{
  webcamUrl: string | null;
  screenUrl: string | null;
}>();

const { t } = useI18n();
const { initHlsPlayer } = useHlsPlayer();

// Video element refs
const webcamVideoRef = ref<HTMLVideoElement | null>(null);
const screenVideoRef = ref<HTMLVideoElement | null>(null);

// HLS instances
let webcamHls: Hls | null = null;
let screenHls: Hls | null = null;

// Error states
const webcamError = ref(false);
const screenError = ref(false);

// Layout mode types and state
type LayoutMode = "side-by-side" | "pip";
type PipPosition = "top-left" | "top-right" | "bottom-left" | "bottom-right";
type PipMain = "webcam" | "screen";

const layoutMode = ref<LayoutMode>("side-by-side");
const pipPosition = ref<PipPosition>("top-right");
const pipMain = ref<PipMain>("screen");

const pipPositionOptions: PipPosition[] = ["top-left", "top-right", "bottom-left", "bottom-right"];

// PiP position class mapping
const pipPositionClass = computed(() => {
  const positionMap: Record<PipPosition, string> = {
    "top-left": "top-3 left-3",
    "top-right": "top-3 right-3",
    "bottom-left": "bottom-3 left-3",
    "bottom-right": "bottom-3 right-3",
  };
  return positionMap[pipPosition.value];
});

// Computed values for PiP mode
const showPipMode = computed(() => layoutMode.value === "pip" && props.webcamUrl && props.screenUrl);
const hasBothStreams = computed(() => props.webcamUrl && props.screenUrl);

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

// Initialize players
function initPlayers() {
  if (webcamVideoRef.value && props.webcamUrl) {
    webcamHls = initHlsPlayer(
      webcamVideoRef.value,
      props.webcamUrl,
      () => {
        webcamError.value = true;
      },
    );
  }

  if (screenVideoRef.value && props.screenUrl) {
    screenHls = initHlsPlayer(
      screenVideoRef.value,
      props.screenUrl,
      () => {
        screenError.value = true;
      },
    );
  }
}

// Reset and reinitialize
function resetPlayers() {
  webcamError.value = false;
  screenError.value = false;
  destroyHlsPlayers();
  nextTick(() => {
    initPlayers();
  });
}

// Watch for URL changes
watch([() => props.webcamUrl, () => props.screenUrl], () => {
  resetPlayers();
});

// Watch for layout mode changes to reinitialize players
watch([layoutMode, pipMain], () => {
  destroyHlsPlayers();
  nextTick(() => {
    initPlayers();
  });
});

onMounted(() => {
  initPlayers();
});

onBeforeUnmount(() => {
  destroyHlsPlayers();
});

// Expose reset function for parent components
defineExpose({ resetPlayers });
</script>

<template>
  <div
    flex flex-col
    gap-2 w-full
  >
    <!-- Control Bar -->
    <div
      v-if="hasBothStreams"
      flex flex-wrap items-center gap-4
      px-2 py-2
      bg-gray-100 dark:bg-gray-900
      rounded-lg
    >
      <!-- Layout Mode Toggle -->
      <div flex items-center gap-2>
        <span text-sm text-gray-600 dark:text-gray-300>
          {{ t("streams.layout.side_by_side") }}
        </span>
        <button
          class="relative inline-flex h-6 w-11 items-center rounded-full transition-colors" :class="[
            layoutMode === 'pip' ? 'bg-blue-600' : 'bg-gray-300 dark:bg-gray-600',
          ]"
          @click="layoutMode = layoutMode === 'side-by-side' ? 'pip' : 'side-by-side'"
        >
          <span
            class="inline-block h-4 w-4 transform rounded-full bg-white transition-transform" :class="[
              layoutMode === 'pip' ? 'translate-x-6' : 'translate-x-1',
            ]"
          />
        </button>
        <span text-sm text-gray-600 dark:text-gray-300>
          {{ t("streams.layout.pip") }}
        </span>
      </div>

      <!-- PiP Controls (only shown in PiP mode) -->
      <template v-if="layoutMode === 'pip'">
        <!-- Main Video Toggle -->
        <div flex items-center gap-2>
          <span text-sm text-gray-600 dark:text-gray-300>
            {{ t("streams.pip.main") }}:
          </span>
          <button
            class="px-3 py-1 text-sm rounded-l-md transition-colors" :class="[
              pipMain === 'screen'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600',
            ]"
            @click="pipMain = 'screen'"
          >
            {{ t("streams.screen") }}
          </button>
          <button
            class="px-3 py-1 text-sm rounded-r-md transition-colors" :class="[
              pipMain === 'webcam'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600',
            ]"
            @click="pipMain = 'webcam'"
          >
            {{ t("streams.webcam") }}
          </button>
        </div>

        <!-- PiP Position Selector -->
        <div flex items-center gap-2>
          <span text-sm text-gray-600 dark:text-gray-300>
            {{ t("streams.pip.position") }}:
          </span>
          <div flex items-center gap-1>
            <button
              v-for="pos in pipPositionOptions"
              :key="pos"
              class="relative w-6 h-6 rounded transition-colors text-xs" :class="[
                pipPosition === pos
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600',
              ]"
              :title="t(`streams.pip.${pos.replace(/-/g, '_')}`)"
              @click="pipPosition = pos"
            >
              <span
                class="absolute w-2 h-2 bg-current rounded-sm" :class="[
                  pos.includes('top') ? 'top-0.5' : 'bottom-0.5',
                  pos.includes('left') ? 'left-0.5' : 'right-0.5',
                ]"
              />
            </button>
          </div>
        </div>
      </template>
    </div>

    <!-- Side by Side Layout -->
    <div
      v-if="!showPipMode"
      flex flex-col md:flex-row
      gap-4 w-full
    >
      <!-- Webcam Stream -->
      <div
        v-if="webcamUrl"
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
        v-if="screenUrl"
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

    <!-- Picture in Picture Layout -->
    <div
      v-else
      class="relative w-full"
    >
      <!-- Main Video -->
      <div
        w-full
        aspect-video
        bg-black
        rounded-lg
        overflow-hidden
      >
        <template v-if="pipMain === 'screen'">
          <video
            v-if="!screenError"
            ref="screenVideoRef"
            controls
            muted
            playsinline
            class="w-full h-full object-contain"
          />
          <div
            v-else
            w-full h-full
            bg-gray-200 dark:bg-gray-700
            flex items-center justify-center
          >
            <span text-gray-500 dark:text-gray-400>
              {{ t("streams.unavailable") }}
            </span>
          </div>
        </template>
        <template v-else>
          <video
            v-if="!webcamError"
            ref="webcamVideoRef"
            controls
            muted
            playsinline
            class="w-full h-full object-contain"
          />
          <div
            v-else
            w-full h-full
            bg-gray-200 dark:bg-gray-700
            flex items-center justify-center
          >
            <span text-gray-500 dark:text-gray-400>
              {{ t("streams.unavailable") }}
            </span>
          </div>
        </template>
      </div>

      <!-- PiP Overlay Video -->
      <div
        class="absolute w-1/4 aspect-video rounded-lg overflow-hidden shadow-lg border-2 border-white dark:border-gray-800" :class="[
          pipPositionClass,
        ]"
      >
        <template v-if="pipMain === 'screen'">
          <video
            v-if="!webcamError"
            ref="webcamVideoRef"
            controls
            muted
            playsinline
            class="w-full h-full object-contain bg-black"
          />
          <div
            v-else
            w-full h-full
            bg-gray-200 dark:bg-gray-700
            flex items-center justify-center
          >
            <span text-xs text-gray-500 dark:text-gray-400>
              {{ t("streams.unavailable") }}
            </span>
          </div>
        </template>
        <template v-else>
          <video
            v-if="!screenError"
            ref="screenVideoRef"
            controls
            muted
            playsinline
            class="w-full h-full object-contain bg-black"
          />
          <div
            v-else
            w-full h-full
            bg-gray-200 dark:bg-gray-700
            flex items-center justify-center
          >
            <span text-xs text-gray-500 dark:text-gray-400>
              {{ t("streams.unavailable") }}
            </span>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>
