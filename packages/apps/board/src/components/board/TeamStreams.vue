<script setup lang="ts">
import type { Rank, Team } from "@xcpcio/core";
import { dayjs } from "@xcpcio/core";
import { SubmissionStatusToString } from "@xcpcio/types";

import "@board/styles/submission-status.css";

const props = defineProps<{
  rank: Rank;
  team: Team;
}>();

const { t } = useI18n();

const PLAYBACK_CHUNK_SECONDS = 180;
const PLAYBACK_END_THROTTLE_MS = 1000;
// The latest recording is considered live when its edge is this close to now.
const LIVE_EDGE_TOLERANCE_MS = 2 * 60 * 1000;
// Hand over to live instead of replaying a short tail at the recording edge.
const LIVE_SWITCH_REMAINING_MS = 30 * 1000;
const SUBMISSION_JUMP_PREROLL_SECONDS = 5;

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

interface SubmissionMarker {
  id: string;
  absoluteTimeMs: number;
  percent: number;
  hasRecording: boolean;
  title: string;
  problemLabel: string;
  statusClass: string;
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

function formatTimestamp(ms: number): string {
  return dayjs(ms).format("MM-DD HH:mm:ss");
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
const timelineRef = ref<HTMLElement | null>(null);
let draggingTimeline = false;
let lastPlaybackEndedAt = 0;
let recordingsRefreshing = false;

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

const contestRange = computed(() => {
  const start = rank.value.contest.startTime.valueOf();
  const end = rank.value.contest.endTime.valueOf();
  return Number.isFinite(start) && Number.isFinite(end) && end > start ? { start, end } : null;
});

const timelineRange = computed(() => contestRange.value ?? range.value);
const timelineStart = computed(() => timelineRange.value?.start ?? 0);
const timelineEnd = computed(() => timelineRange.value?.end ?? 0);
const recordingStart = computed(() => range.value?.start ?? 0);
const recordingEnd = computed(() => range.value?.end ?? 0);
const recordingStartPercent = computed(() => {
  const timeline = timelineRange.value;
  const recording = range.value;
  if (!timeline || !recording) {
    return 0;
  }

  const duration = timeline.end - timeline.start;
  if (duration <= 0) {
    return 0;
  }

  return Math.max(0, Math.min(100, ((recording.start - timeline.start) / duration) * 100));
});
const recordingEndPercent = computed(() => {
  const timeline = timelineRange.value;
  const recording = range.value;
  if (!timeline || !recording) {
    return 0;
  }

  const duration = timeline.end - timeline.start;
  if (duration <= 0) {
    return 0;
  }

  return Math.max(0, Math.min(100, ((recording.end - timeline.start) / duration) * 100));
});
const recordingWidthPercent = computed(() => Math.max(0, recordingEndPercent.value - recordingStartPercent.value));

const submissionMarkers = computed<SubmissionMarker[]>(() => {
  const timeline = timelineRange.value;
  const recording = range.value;
  if (!timeline) {
    return [];
  }

  const timelineDuration = timeline.end - timeline.start;
  if (timelineDuration <= 0) {
    return [];
  }

  const contestStartMs = rank.value.contest.startTime.valueOf();
  const noRecordingLabel = t("streams.no_recording");

  return team.value.submissions
    .map(submission => ({
      submission,
      absoluteTimeMs: contestStartMs + submission.timestampToSecond * 1000,
    }))
    .map(({ submission, absoluteTimeMs }) => {
      const problemLabel = rank.value.contest.problemsMap.get(submission.problemId)?.label ?? submission.problemId;
      const statusLabel = SubmissionStatusToString[submission.status] ?? submission.status.toString();
      const hasRecording = !!recording && absoluteTimeMs >= recording.start && absoluteTimeMs <= recording.end;
      const percent = Math.max(0, Math.min(100, ((absoluteTimeMs - timeline.start) / timelineDuration) * 100));

      return {
        id: submission.id || String(absoluteTimeMs),
        absoluteTimeMs,
        percent,
        hasRecording,
        title: `${formatTimestamp(absoluteTimeMs)} (${submission.timestampDisplayFormatWithSecond}) · ${problemLabel} · ${statusLabel}${hasRecording ? "" : ` · ${noRecordingLabel}`}`,
        problemLabel,
        statusClass: submission.status.toString(),
      };
    });
});

const maxOffset = computed(() => {
  const timeline = timelineRange.value;
  if (!timeline) {
    return 0;
  }

  return Math.max(0, Math.floor((timeline.end - timeline.start) / 1000));
});

const defaultPlaybackOffset = computed(() => {
  const timeline = timelineRange.value;
  if (!timeline) {
    return 0;
  }

  const recording = range.value;
  if (!recording) {
    return maxOffset.value;
  }

  const recordingStartOffset = Math.floor((recording.start - timeline.start) / 1000);
  const recordingEndMs = Math.min(recording.end, timeline.end);
  const latestRecordedOffset = Math.floor((recordingEndMs - timeline.start) / 1000) - PLAYBACK_CHUNK_SECONDS;
  return Math.max(0, Math.min(maxOffset.value, Math.max(recordingStartOffset, latestRecordedOffset)));
});

const sliderPercent = computed(() => {
  if (maxOffset.value <= 0) {
    return 0;
  }

  return Math.max(0, Math.min(100, (sliderValue.value / maxOffset.value) * 100));
});

const canPlayback = computed(() => !!(webcamPlaybackSource.value || screenPlaybackSource.value));
const canLive = computed(() => !!(liveWebcamUrl.value || liveScreenUrl.value));
const latestRecordingEnd = computed(() => getRecordingRange([...webcamRecordings.value, ...screenRecordings.value])?.end ?? null);
const playbackStartMs = computed(() => {
  const timeline = timelineRange.value;
  return timeline ? timeline.start + playbackOffset.value * 1000 : 0;
});
const playbackDurationSeconds = computed(() => {
  const timeline = timelineRange.value;
  if (!timeline) {
    return 0;
  }

  return Math.max(1, Math.min(PLAYBACK_CHUNK_SECONDS, (timeline.end - playbackStartMs.value) / 1000));
});

const hasRecordingAtPlaybackStart = computed(() => hasRecordingAt(playbackStartMs.value));

function containsRecording(recordings: PlaybackRecording[], timestampMs: number): boolean {
  return recordings.some((recording) => {
    const start = parseRecordingTime(recording.start);
    const end = start + Number(recording.duration) * 1000;
    return Number.isFinite(start) && timestampMs >= start && timestampMs < end;
  });
}

// Gap-aware check that mirrors how `range` picks the playable streams: when
// both streams overlap, playback requires both of them; otherwise it falls
// back to the webcam and then the screen. The /list range is a union of
// recording segments, so segment boundaries have to be checked individually.
function hasRecordingAt(timestampMs: number): boolean {
  const webcam = webcamRange.value;
  const screen = screenRange.value;

  if (webcam && screen) {
    const intersects = Math.min(webcam.end, screen.end) > Math.max(webcam.start, screen.start);
    if (intersects) {
      return containsRecording(webcamRecordings.value, timestampMs)
        && containsRecording(screenRecordings.value, timestampMs);
    }
  }

  if (webcam) {
    return containsRecording(webcamRecordings.value, timestampMs);
  }

  if (screen) {
    return containsRecording(screenRecordings.value, timestampMs);
  }

  return false;
}

async function onPlaybackEnded(playedSeconds: number) {
  if (mode.value !== "playback") {
    return;
  }

  const timeline = timelineRange.value;
  if (!timeline) {
    return;
  }

  // Both the webcam and screen players report the end of the same chunk; only
  // handle the first report (the second can land after the players were reset).
  const now = Date.now();
  if (now - lastPlaybackEndedAt < PLAYBACK_END_THROTTLE_MS) {
    return;
  }
  lastPlaybackEndedAt = now;

  const currentOffset = playbackOffset.value;
  const currentTeamId = team.value.id;
  const requestedSeconds = Math.ceil(playbackDurationSeconds.value);
  const played = Number.isFinite(playedSeconds) && playedSeconds > 0
    ? Math.min(Math.ceil(playedSeconds), requestedSeconds + 10)
    : requestedSeconds;
  const nextOffset = currentOffset + Math.max(1, played);
  if (nextOffset >= maxOffset.value) {
    return;
  }

  const nextStartMs = timeline.start + nextOffset * 1000;
  const advance = () => {
    sliderValue.value = nextOffset;
    playbackOffset.value = nextOffset;
  };

  // Keep playing past the current chunk while recordings are available.
  if (hasRecordingAt(nextStartMs)) {
    advance();
    return;
  }

  // The recordings snapshot is taken when playback starts; while the contest
  // is running, more footage may have been recorded since then.
  await refreshRecordings();

  // The user may have switched teams/modes or seeked while the refresh was in flight.
  if (team.value.id !== currentTeamId || mode.value !== "playback" || playbackOffset.value !== currentOffset) {
    return;
  }

  const edge = latestRecordingEnd.value;
  if (edge === null) {
    return;
  }

  const isLiveEdge = Date.now() - edge <= LIVE_EDGE_TOLERANCE_MS;
  const remainingMs = edge - nextStartMs;

  if (hasRecordingAt(nextStartMs) && (!isLiveEdge || remainingMs > LIVE_SWITCH_REMAINING_MS)) {
    advance();
    return;
  }

  // Caught up with the live recording: hand over to the live stream instead of
  // requesting ever-shorter chunks at the edge. Realtime reaction keeps its
  // own 3-minute window.
  if (isLiveEdge && canLive.value) {
    mode.value = "live";
  }
}

const playbackWebcamUrl = computed(() => {
  const source = webcamPlaybackSource.value;
  if (!source || !hasRecordingAtPlaybackStart.value) {
    return null;
  }

  return buildPlaybackUrl(source, playbackStartMs.value, playbackDurationSeconds.value);
});

const playbackScreenUrl = computed(() => {
  const source = screenPlaybackSource.value;
  if (!source || !hasRecordingAtPlaybackStart.value) {
    return null;
  }

  return buildPlaybackUrl(source, playbackStartMs.value, playbackDurationSeconds.value);
});

const webcamUrl = computed(() => (mode.value === "playback" ? playbackWebcamUrl.value : liveWebcamUrl.value));
const screenUrl = computed(() => (mode.value === "playback" ? playbackScreenUrl.value : liveScreenUrl.value));

async function fetchRecordingsSnapshot(teamId: string) {
  const results = await Promise.allSettled([
    fetchRecordings(webcamPlaybackSource.value?.listUrl),
    fetchRecordings(screenPlaybackSource.value?.listUrl),
  ]);

  if (team.value.id !== teamId) {
    return null;
  }

  return {
    webcam: results[0].status === "fulfilled" ? results[0].value : null,
    screen: results[1].status === "fulfilled" ? results[1].value : null,
  };
}

async function loadRecordings() {
  if (recordingsLoaded.value || recordingsLoading.value) {
    return;
  }

  recordingsLoading.value = true;
  recordingsError.value = false;

  try {
    const snapshot = await fetchRecordingsSnapshot(team.value.id);
    if (!snapshot) {
      return;
    }

    webcamRecordings.value = snapshot.webcam ?? [];
    screenRecordings.value = snapshot.screen ?? [];
    recordingsLoaded.value = true;

    const hasRecordings = webcamRecordings.value.length > 0 || screenRecordings.value.length > 0;
    recordingsError.value = !hasRecordings && (snapshot.webcam === null || snapshot.screen === null);
  } catch {
    recordingsError.value = true;
  } finally {
    recordingsLoading.value = false;
  }
}

async function refreshRecordings(): Promise<boolean> {
  if (recordingsRefreshing) {
    return false;
  }

  recordingsRefreshing = true;
  try {
    const snapshot = await fetchRecordingsSnapshot(team.value.id);
    if (!snapshot) {
      return false;
    }

    let updated = false;
    if (snapshot.webcam) {
      webcamRecordings.value = snapshot.webcam;
      updated = true;
    }
    if (snapshot.screen) {
      screenRecordings.value = snapshot.screen;
      updated = true;
    }
    return updated;
  } finally {
    recordingsRefreshing = false;
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

function updateSliderFromClientX(clientX: number) {
  const element = timelineRef.value;
  if (!element || maxOffset.value <= 0) {
    return;
  }

  const rect = element.getBoundingClientRect();
  if (rect.width <= 0) {
    return;
  }

  const percent = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
  sliderValue.value = Math.round(percent * maxOffset.value);
}

function onTimelinePointerDown(event: PointerEvent) {
  if (maxOffset.value <= 0) {
    return;
  }

  draggingTimeline = true;
  (event.currentTarget as HTMLElement).setPointerCapture(event.pointerId);
  updateSliderFromClientX(event.clientX);
}

function onTimelinePointerMove(event: PointerEvent) {
  if (!draggingTimeline) {
    return;
  }

  updateSliderFromClientX(event.clientX);
}

function onTimelinePointerUp(event: PointerEvent) {
  if (!draggingTimeline) {
    return;
  }

  draggingTimeline = false;
  const element = event.currentTarget as HTMLElement;
  if (element.hasPointerCapture(event.pointerId)) {
    element.releasePointerCapture(event.pointerId);
  }
  commitSlider();
}

function onTimelineKeydown(event: KeyboardEvent) {
  if (maxOffset.value <= 0) {
    return;
  }

  let nextValue = sliderValue.value;
  switch (event.key) {
    case "ArrowLeft":
    case "ArrowDown":
      nextValue -= 1;
      break;
    case "ArrowRight":
    case "ArrowUp":
      nextValue += 1;
      break;
    case "Home":
      nextValue = 0;
      break;
    case "End":
      nextValue = maxOffset.value;
      break;
    default:
      return;
  }

  event.preventDefault();
  sliderValue.value = Math.max(0, Math.min(maxOffset.value, nextValue));
  commitSlider();
}

function jumpToSubmission(marker: SubmissionMarker) {
  const timeline = timelineRange.value;
  if (!timeline) {
    return;
  }

  const offsetSeconds = Math.floor((marker.absoluteTimeMs - timeline.start) / 1000) - SUBMISSION_JUMP_PREROLL_SECONDS;
  const clampedOffset = Math.max(0, Math.min(maxOffset.value, offsetSeconds));

  mode.value = "playback";
  sliderValue.value = clampedOffset;
  playbackOffset.value = clampedOffset;
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

  sliderValue.value = defaultPlaybackOffset.value;
  playbackOffset.value = defaultPlaybackOffset.value;
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
        <div
          v-if="submissionMarkers.length > 0"
          class="relative h-7"
        >
          <button
            v-for="marker in submissionMarkers"
            :key="marker.id"
            type="button"
            class="absolute bottom-0 -translate-x-1/2 cursor-pointer border-0 bg-transparent p-0"
            :style="{ left: `${marker.percent}%` }"
            :class="[marker.statusClass, marker.hasRecording ? '' : 'opacity-50']"
            :title="marker.title"
            @click="jumpToSubmission(marker)"
          >
            <span class="block text-[10px] font-semibold leading-3">{{ marker.problemLabel }}</span>
            <span class="mx-auto block h-3 w-0.5 bg-current" />
          </button>
        </div>
        <div
          ref="timelineRef"
          class="relative h-6 w-full cursor-pointer touch-none"
          role="slider"
          tabindex="0"
          :aria-valuemin="0"
          :aria-valuemax="maxOffset"
          :aria-valuenow="sliderValue"
          @pointerdown="onTimelinePointerDown"
          @pointermove="onTimelinePointerMove"
          @pointerup="onTimelinePointerUp"
          @pointercancel="onTimelinePointerUp"
          @keydown="onTimelineKeydown"
        >
          <div class="absolute inset-x-0 top-1/2 h-1.5 -translate-y-1/2 rounded bg-gray-200 dark:bg-gray-700">
            <div
              class="absolute inset-y-0 bg-blue-300 dark:bg-blue-800"
              :style="{ left: `${recordingStartPercent}%`, width: `${recordingWidthPercent}%` }"
            />
          </div>
          <div
            class="absolute top-1/2 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white bg-blue-600 shadow"
            :style="{ left: `${sliderPercent}%` }"
          />
        </div>
        <div flex justify-between text-xs text-gray-500 dark:text-gray-400>
          <span>{{ formatTimestamp(timelineStart) }}</span>
          <span>
            {{ t("streams.playback_position") }}:
            {{ formatTimestamp(timelineStart + sliderValue * 1000) }}
          </span>
          <span>{{ formatTimestamp(timelineEnd) }}</span>
        </div>
        <div class="flex flex-wrap items-center justify-between gap-2 text-xs text-gray-500 dark:text-gray-400">
          <span class="inline-flex items-center gap-2">
            <span class="inline-block h-1.5 w-4 rounded bg-blue-300 dark:bg-blue-800" />
            {{ t("streams.recording_range") }}: {{ formatTimestamp(recordingStart) }} - {{ formatTimestamp(recordingEnd) }}
          </span>
          <span
            v-if="!hasRecordingAtPlaybackStart"
            class="text-amber-600 dark:text-amber-400"
          >
            {{ t("streams.no_recording_at_time") }}
          </span>
        </div>
      </template>
    </div>

    <DualStreamPlayer
      :webcam-url="webcamUrl"
      :screen-url="screenUrl"
      @ended="onPlaybackEnded"
    />
  </div>
</template>
