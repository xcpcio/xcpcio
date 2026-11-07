<script setup lang="ts">
import type { Rank, Team } from "@xcpcio/core";
import { dayjs } from "@xcpcio/core";

const props = defineProps<{
  rank: Rank;
  team: Team;
}>();

const { t } = useI18n();

const PLAYBACK_WINDOW_SECONDS = 180;

const TEAM_ID_PLACEHOLDER = /\$\{team_id\}/g;
const TEAM_IP_PLACEHOLDER = /\$\{team_ip\}/;
const TEAM_IP_PLACEHOLDER_GLOBAL = /\$\{team_ip\}/g;
const TEMPLATE_PLACEHOLDER = /\$\{[^}]+\}/g;
const RFC3339_FRACTION = /^(.*\.\d{3})\d+(Z|[+-]\d{2}:\d{2})$/;

interface PlaybackRecording {
  start: string;
  duration: number;
}

interface PlaybackSource {
  listUrl: string;
  getUrl: string;
  path: string;
}

type StreamMode = "live" | "playback";

const rank = computed(() => props.rank);
const team = computed(() => props.team);

function buildLiveStreamUrl(template: string | undefined, team: Team): string | null {
  if (!template) {
    return null;
  }

  if (TEAM_IP_PLACEHOLDER.test(template) && !team.ip) {
    return null;
  }

  return template
    .replace(TEAM_ID_PLACEHOLDER, team.id)
    .replace(TEAM_IP_PLACEHOLDER_GLOBAL, team.ip ?? "");
}

// The realtime reaction templates point at the team's mediamtx playback server.
// Reuse their origin and path for team-level playback; /list and /get are CORS-enabled.
function buildPlaybackSource(template: string | undefined, team: Team): PlaybackSource | null {
  if (!template || !team.ip) {
    return null;
  }

  const normalized = template
    .replace(TEAM_ID_PLACEHOLDER, team.id)
    .replace(TEAM_IP_PLACEHOLDER_GLOBAL, team.ip)
    .replace(TEMPLATE_PLACEHOLDER, "x");

  try {
    const url = new URL(normalized);
    const path = url.searchParams.get("path");
    if (!path || !url.pathname.endsWith("/get")) {
      return null;
    }

    const getUrl = new URL(url.toString());
    getUrl.search = "";

    const listUrl = new URL(getUrl.toString());
    listUrl.pathname = `${getUrl.pathname.slice(0, -"/get".length)}/list`;
    listUrl.searchParams.set("path", path);

    return {
      listUrl: listUrl.toString(),
      getUrl: getUrl.toString(),
      path,
    };
  } catch {
    return null;
  }
}

function buildPlaybackUrl(source: PlaybackSource, startMs: number, durationSeconds: number): string {
  const url = new URL(source.getUrl);
  url.searchParams.set("path", source.path);
  url.searchParams.set("start", new Date(startMs).toISOString());
  url.searchParams.set("duration", String(Math.max(1, Math.ceil(durationSeconds))));
  return url.toString();
}

function parseRecordingTime(value: string): number {
  return Date.parse(value.replace(RFC3339_FRACTION, "$1$2"));
}

function getRecordingRange(recordings: PlaybackRecording[]): { start: number; end: number } | null {
  let start = Number.POSITIVE_INFINITY;
  let end = Number.NEGATIVE_INFINITY;

  for (const recording of recordings) {
    const recordingStart = parseRecordingTime(recording.start);
    const recordingEnd = recordingStart + Number(recording.duration) * 1000;
    if (!Number.isFinite(recordingStart) || !Number.isFinite(recordingEnd) || recordingEnd <= recordingStart) {
      continue;
    }

    start = Math.min(start, recordingStart);
    end = Math.max(end, recordingEnd);
  }

  return Number.isFinite(start) && Number.isFinite(end) ? { start, end } : null;
}

async function fetchRecordings(url?: string): Promise<PlaybackRecording[]> {
  if (!url) {
    return [];
  }

  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Failed to load recordings: ${response.status}`);
  }

  const data: unknown = await response.json();
  if (!Array.isArray(data)) {
    return [];
  }

  return data.filter((item): item is PlaybackRecording => {
    if (typeof item !== "object" || item === null) {
      return false;
    }

    const recording = item as Partial<PlaybackRecording>;
    return typeof recording.start === "string" && typeof recording.duration === "number";
  });
}

const liveWebcamUrl = computed(() => buildLiveStreamUrl(rank.value.contest.options.teamWebcamStreamUrlTemplate, team.value));
const liveScreenUrl = computed(() => buildLiveStreamUrl(rank.value.contest.options.teamScreenStreamUrlTemplate, team.value));

const webcamPlaybackSource = computed(() => buildPlaybackSource(rank.value.contest.options.realtimeReactionWebcamStreamUrlTemplate, team.value));
const screenPlaybackSource = computed(() => buildPlaybackSource(rank.value.contest.options.realtimeReactionScreenStreamUrlTemplate, team.value));

const webcamRecordings = ref<PlaybackRecording[]>([]);
const screenRecordings = ref<PlaybackRecording[]>([]);
const recordingsLoaded = ref(false);
const recordingsLoading = ref(false);
const recordingsError = ref(false);

const mode = ref<StreamMode>("live");
const sliderValue = ref(0);
const playbackOffset = ref(0);
const offsetInitialized = ref(false);

const webcamRange = computed(() => getRecordingRange(webcamRecordings.value));
const screenRange = computed(() => getRecordingRange(screenRecordings.value));
const range = computed(() => {
  const webcam = webcamRange.value;
  const screen = screenRange.value;
  if (webcam && screen) {
    const start = Math.max(webcam.start, screen.start);
    const end = Math.min(webcam.end, screen.end);
    if (end > start) {
      return { start, end };
    }
  }

  return webcam ?? screen;
});

const timelineStart = computed(() => range.value?.start ?? 0);
const timelineEnd = computed(() => range.value?.end ?? 0);

const maxOffset = computed(() => {
  const currentRange = range.value;
  if (!currentRange) {
    return 0;
  }

  return Math.max(0, Math.floor((currentRange.end - currentRange.start) / 1000) - PLAYBACK_WINDOW_SECONDS);
});

const canPlayback = computed(() => !!(webcamPlaybackSource.value || screenPlaybackSource.value));
const playbackStartMs = computed(() => (range.value ? range.value.start + playbackOffset.value * 1000 : 0));
const playbackDurationSeconds = computed(() => {
  const currentRange = range.value;
  if (!currentRange) {
    return 0;
  }

  return Math.max(1, Math.min(PLAYBACK_WINDOW_SECONDS, (currentRange.end - playbackStartMs.value) / 1000));
});

const playbackWebcamUrl = computed(() => {
  const source = webcamPlaybackSource.value;
  if (!source || !range.value) {
    return null;
  }

  return buildPlaybackUrl(source, playbackStartMs.value, playbackDurationSeconds.value);
});

const playbackScreenUrl = computed(() => {
  const source = screenPlaybackSource.value;
  if (!source || !range.value) {
    return null;
  }

  return buildPlaybackUrl(source, playbackStartMs.value, playbackDurationSeconds.value);
});

const webcamUrl = computed(() => (mode.value === "playback" ? playbackWebcamUrl.value : liveWebcamUrl.value));
const screenUrl = computed(() => (mode.value === "playback" ? playbackScreenUrl.value : liveScreenUrl.value));

async function loadRecordings() {
  if (recordingsLoaded.value || recordingsLoading.value) {
    return;
  }

  recordingsLoading.value = true;
  recordingsError.value = false;

  try {
    const results = await Promise.allSettled([
      fetchRecordings(webcamPlaybackSource.value?.listUrl),
      fetchRecordings(screenPlaybackSource.value?.listUrl),
    ]);

    webcamRecordings.value = results[0].status === "fulfilled" ? results[0].value : [];
    screenRecordings.value = results[1].status === "fulfilled" ? results[1].value : [];
    recordingsLoaded.value = true;

    const hasRecordings = webcamRecordings.value.length > 0 || screenRecordings.value.length > 0;
    recordingsError.value = !hasRecordings && results.some(result => result.status === "rejected");
  } catch {
    recordingsError.value = true;
  } finally {
    recordingsLoading.value = false;
  }
}

function enterPlayback() {
  mode.value = "playback";
  if (!recordingsLoaded.value) {
    loadRecordings();
  }
}

function commitSlider() {
  playbackOffset.value = sliderValue.value;
}

function formatTimestamp(ms: number): string {
  return dayjs(ms).format("MM-DD HH:mm:ss");
}

function resetPlayback() {
  webcamRecordings.value = [];
  screenRecordings.value = [];
  recordingsLoaded.value = false;
  recordingsLoading.value = false;
  recordingsError.value = false;
  offsetInitialized.value = false;
  mode.value = "live";
  sliderValue.value = 0;
  playbackOffset.value = 0;
}

watch(range, (currentRange) => {
  if (!currentRange || offsetInitialized.value) {
    return;
  }

  sliderValue.value = maxOffset.value;
  playbackOffset.value = maxOffset.value;
  offsetInitialized.value = true;
}, { immediate: true });

watch(() => team.value.id, resetPlayback);
</script>

<template>
  <div flex flex-col gap-3>
    <div
      v-if="canPlayback"
      flex flex-wrap items-center justify-between gap-2
    >
      <div flex items-center gap-2>
        <button
          type="button"
          class="rounded px-3 py-1 text-sm transition-colors"
          :class="[
            mode === 'live'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600',
          ]"
          @click="mode = 'live'"
        >
          {{ t("streams.live") }}
        </button>
        <button
          type="button"
          class="rounded px-3 py-1 text-sm transition-colors"
          :class="[
            mode === 'playback'
              ? 'bg-blue-600 text-white'
              : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 dark:hover:bg-gray-600',
          ]"
          @click="enterPlayback"
        >
          {{ t("streams.playback") }}
        </button>
      </div>

      <span
        v-if="mode === 'playback' && range"
        text-xs text-gray-500 dark:text-gray-400
      >
        {{ t("streams.playback_range", { start: formatTimestamp(timelineStart), end: formatTimestamp(timelineEnd) }) }}
      </span>
    </div>

    <div
      v-if="mode === 'playback'"
      flex flex-col gap-1
    >
      <div
        v-if="recordingsLoading"
        text-sm text-gray-500 dark:text-gray-400
      >
        {{ t("streams.loading_recordings") }}
      </div>
      <div
        v-else-if="recordingsError"
        text-sm text-red-500
      >
        {{ t("streams.recordings_failed") }}
      </div>
      <div
        v-else-if="!range"
        text-sm text-gray-500 dark:text-gray-400
      >
        {{ t("streams.no_recordings") }}
      </div>
      <template v-else>
        <input
          v-model.number="sliderValue"
          type="range"
          min="0"
          :max="maxOffset"
          step="1"
          class="w-full accent-blue-600"
          @change="commitSlider"
        >
        <div flex justify-between text-xs text-gray-500 dark:text-gray-400>
          <span>{{ formatTimestamp(timelineStart) }}</span>
          <span>
            {{ t("streams.playback_position") }}:
            {{ formatTimestamp(timelineStart + sliderValue * 1000) }}
          </span>
          <span>{{ formatTimestamp(timelineEnd) }}</span>
        </div>
      </template>
    </div>

    <DualStreamPlayer
      :webcam-url="webcamUrl"
      :screen-url="screenUrl"
    />
  </div>
</template>
