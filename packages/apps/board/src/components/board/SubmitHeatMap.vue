<script setup lang="ts">
import type { Rank } from "@xcpcio/core";
import { SubmissionStatus } from "@xcpcio/types";

const props = defineProps<{
  rank: Rank;
}>();

const { t } = useI18n();

const rank = computed(() => props.rank);

const mapTimeDiffLength = 20;
const startTime = rank.value.contest.getStartTime();
const endTime = rank.value.contest.getEndTime();
const totalDuration = endTime.diff(startTime, "minute");
const intervalSize = totalDuration / mapTimeDiffLength;

const correctStatus = [
  SubmissionStatus.ACCEPTED,
  SubmissionStatus.CORRECT,
];

const incorrectStatus = [
  SubmissionStatus.REJECTED,
  SubmissionStatus.WRONG_ANSWER,
  SubmissionStatus.PARTIALLY_CORRECT,
  SubmissionStatus.PRESENTATION_ERROR,
  SubmissionStatus.MEMORY_LIMIT_EXCEEDED,
  SubmissionStatus.TIME_LIMIT_EXCEEDED,
  SubmissionStatus.OUTPUT_LIMIT_EXCEEDED,
  SubmissionStatus.RUNTIME_ERROR,
];

const submissions = computed(() => rank.value.getSubmissions());

const intervalDescriptions = Array.from({ length: mapTimeDiffLength }, (_, index) => {
  const start = index * intervalSize;
  const end = (index + 1) * intervalSize;
  return `Between ${start} and ${end} minutes: `;
});

const submissionsByProblemId = computed(() => {
  const result = new Map();

  rank.value.contest.problems.forEach((p) => {
    result.set(p.id, { accepted: [], rejected: [] });
  });

  submissions.value.forEach((s) => {
    const entry = result.get(s.problemId);
    if (!entry) {
      return;
    }

    if (correctStatus.includes(s.status)) {
      entry.accepted.push(s);
    } else if (incorrectStatus.includes(s.status)) {
      entry.rejected.push(s);
    }
  });

  return result;
});

function generateHeatMap(submissions: Map<any, any>, type: "correct" | "incorrect") {
  const counts = Array.from<number>({ length: mapTimeDiffLength }).fill(0);

  submissions.forEach((s) => {
    const index = Math.min(Math.floor(s.timestampToMinute / intervalSize), mapTimeDiffLength - 1);
    counts[index]++;
  });

  return counts.map((count, i) => ({
    count,
    level: 0,
    description: `${intervalDescriptions[i]}${count} ${type} submissions`,
  }));
}

function calculateThresholds(counts: number[]) {
  const sorted = [...counts].sort((a, b) => b - a);
  return [
    0,
    sorted[Math.floor(mapTimeDiffLength * 0.2)] || 0,
    sorted[Math.floor(mapTimeDiffLength * 0.4)] || 0,
    sorted[Math.floor(mapTimeDiffLength * 0.6)] || 0,
    sorted[Math.floor(mapTimeDiffLength * 0.8)] || 0,
  ];
}

function getHeatLevel(thresholds: number[], count: number) {
  return count <= thresholds[0]
    ? 0
    : count <= thresholds[1]
      ? 1
      : count <= thresholds[2]
        ? 2
        : count <= thresholds[3] ? 3 : 4;
}

const heatMapData = computed(() =>
  rank.value.contest.problems.map((p) => {
    const { accepted, rejected } = submissionsByProblemId.value.get(p.id)!;

    const correctHeatMap = generateHeatMap(accepted, "correct");
    const incorrectHeatMap = generateHeatMap(rejected, "incorrect");

    const correctThresholds = calculateThresholds(correctHeatMap.map(i => i.count));
    const incorrectThresholds = calculateThresholds(incorrectHeatMap.map(i => i.count));

    correctHeatMap.forEach(i => i.level = getHeatLevel(correctThresholds, i.count));
    incorrectHeatMap.forEach(i => i.level = getHeatLevel(incorrectThresholds, i.count));

    return {
      id: p.id,
      label: p.label,
      balloonColor: p.balloonColor,
      correctHeatMap,
      incorrectHeatMap,
    };
  }),
);
</script>

<template>
  <div flex flex-col mb-8>
    <span
      text-align-center
      text-size-lg
      font-semibold
      mb-8
    >
      {{ t("standings.statistics.submit_heatmap") }}
    </span>

    <div
      grid grid-cols-3
      gap-10 space-y-0
      place-items-center
    >
      <div
        v-for="heatMap in heatMapData" :key="heatMap.label"
        class="w-350px h-100px"
        flex flex-col
        items-center justify-center
        border border-gray-100 dark:border-gray-600
        rounded-md
        shadow
      >
        <div
          mb-3
          size-30px
          flex
          justify-center items-center
          rounded-md
          :style="{ backgroundColor: heatMap.balloonColor.background_color, color: heatMap.balloonColor.color }"
        >
          <span text-size-lg font-semibold>
            {{ heatMap.label }}
          </span>
        </div>
        <div>
          <div
            flex flex-row
            gap-1 mb-2
          >
            <Tooltip
              v-for="(corretcItem, index) in heatMap.correctHeatMap" :key="`ac-${index}`"
              w-inherit
            >
              <div
                :data-level="corretcItem.level"
                class="accept-heat"
                size-12px
                rounded-1
                shadow
                border border-gray-100 dark:border-gray-600
              />
              <template #popper>
                <div
                  flex
                >
                  <div>
                    {{ corretcItem.description }}
                  </div>
                </div>
              </template>
            </Tooltip>
          </div>

          <div
            flex flex-row
            gap-1
          >
            <Tooltip
              v-for="(incorrectItem, index) in heatMap.incorrectHeatMap" :key="`wa-${index}`"
              w-inherit
            >
              <div
                :data-level="incorrectItem.level"
                class="rejected-heat"
                size-12px
                rounded-1
                shadow
                border border-gray-100 dark:border-gray-600
              />
              <template #popper>
                <div
                  flex
                >
                  <div>
                    {{ incorrectItem.description }}
                  </div>
                </div>
              </template>
            </Tooltip>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="less">
@import "./SubmitHeatMap.less";
</style>
