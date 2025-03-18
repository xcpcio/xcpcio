<script setup lang="ts">
import type { Rank } from "@xcpcio/core";
import { SubmissionStatus } from "@xcpcio/types";

const props = defineProps<{
  rank: Rank;
}>();

const mapTimeDiffLength = 20;
const rank = computed(() => props.rank);
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
const submissionsByProblemId = computed(() => {
  const result = new Map();
  for (const p of rank.value.contest.problems) {
    result.set(p.id, {
      accepted: submissions.value.filter(s => s.problemId === p.id && correctStatus.includes(s.status)),
      rejected: submissions.value.filter(s => s.problemId === p.id && incorrectStatus.includes(s.status)),
    });
  }
  return result;
});

const intervalDescriptions = computed(() => {
  return Array.from({ length: mapTimeDiffLength }, (_, index) => {
    const start = index * intervalSize;
    const end = (index + 1) * intervalSize;
    return `Between ${start} and ${end} minutes: `;
  });
});

const heatMapData = computed(() => {
  const h = [];

  for (const p of rank.value.contest.problems) {
    const problemSubmissions = submissionsByProblemId.value.get(p.id);
    const acSubmits = problemSubmissions.accepted;
    const waSubmits = problemSubmissions.rejected;

    const acHeatMap = Array.from({ length: mapTimeDiffLength }, (_, index) => ({
      count: 0,
      level: 0,
      description: `${intervalDescriptions.value[index]}0 correct submissions`,
    }));

    const waHeatMap = Array.from({ length: mapTimeDiffLength }, (_, index) => ({
      count: 0,
      level: 0,
      description: `${intervalDescriptions.value[index]}0 incorrect submissions`,
    }));

    for (const s of acSubmits) {
      const duration = s.timestampToMinute;
      const index = Math.min(Math.floor(duration / intervalSize), mapTimeDiffLength - 1);
      acHeatMap[index].count++;
    }

    for (const s of waSubmits) {
      const duration = s.timestampToMinute;
      const index = Math.min(Math.floor(duration / intervalSize), mapTimeDiffLength - 1);
      waHeatMap[index].count++;
    }

    for (let i = 0; i < mapTimeDiffLength; i++) {
      if (acHeatMap[i].count > 0) {
        acHeatMap[i].description = `${intervalDescriptions.value[i] + acHeatMap[i].count} correct submissions`;
      }
    }

    for (let i = 0; i < mapTimeDiffLength; i++) {
      if (waHeatMap[i].count > 0) {
        waHeatMap[i].description = `${intervalDescriptions.value[i] + waHeatMap[i].count} incorrect submissions`;
      }
    }

    const sortedAcHeatMap = acHeatMap.slice().sort((a, b) => b.count - a.count);
    const sortedWaHeatMap = waHeatMap.slice().sort((a, b) => b.count - a.count);

    const heatLevelThresholds = computed(() => {
      const correctLevelThresholds = [
        0,
        sortedAcHeatMap[Math.floor(mapTimeDiffLength * 0.2)].count,
        sortedAcHeatMap[Math.floor(mapTimeDiffLength * 0.4)].count,
        sortedAcHeatMap[Math.floor(mapTimeDiffLength * 0.6)].count,
        sortedAcHeatMap[Math.floor(mapTimeDiffLength * 0.8)].count,
      ];
      const incorrectLevelThresholds = [
        0,
        sortedWaHeatMap[Math.floor(mapTimeDiffLength * 0.2)].count,
        sortedWaHeatMap[Math.floor(mapTimeDiffLength * 0.4)].count,
        sortedWaHeatMap[Math.floor(mapTimeDiffLength * 0.6)].count,
        sortedWaHeatMap[Math.floor(mapTimeDiffLength * 0.8)].count,
      ];
      return { correctLevelThresholds, incorrectLevelThresholds };
    });

    function getHeatLevel(thresholds: number[], count: number) {
      if (count <= thresholds[0]) {
        return 0;
      } else if (count <= thresholds[1]) {
        return 1;
      } else if (count <= thresholds[2]) {
        return 2;
      } else if (count <= thresholds[3]) {
        return 3;
      } else {
        return 4;
      }
    }

    acHeatMap.forEach((h) => {
      h.level = getHeatLevel(heatLevelThresholds.value.correctLevelThresholds, h.count);
    });

    waHeatMap.forEach((h) => {
      h.level = getHeatLevel(heatLevelThresholds.value.incorrectLevelThresholds, h.count);
    });

    h.push({
      id: p.id,
      label: p.label,
      balloonColor: p.balloonColor,
      acHeatMap,
      waHeatMap,
    });
  }
  return h;
});
</script>

<template>
  <div flex flex-col mb-8>
    <span
      text-align-center
      text-size-lg
      font-semibold
      mb-8
    >
      提交热力图
    </span>

    <div
      grid grid-cols-3
      gap-10 space-y-0
      place-items-center
    >
      <div
        v-for="heatMap in heatMapData" :key="heatMap.label"
        flex flex-col
        items-center justify-center
        w-350px h-100px
        rounded-md
        border border-gray-100 dark:border-gray-600
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
          <div flex flex-row gap-1 mb-2>
            <Tooltip
              v-for="(acItem, index) in heatMap.acHeatMap" :key="`ac-${index}`"
              w-inherit
            >
              <div
                class="accept-heat"
                :data-level="acItem.level"
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
                    {{ acItem.description }}
                  </div>
                </div>
              </template>
            </Tooltip>
          </div>

          <div flex flex-row gap-1>
            <Tooltip v-for="(waItem, index) in heatMap.waHeatMap" :key="`wa-${index}`" w-inherit>
              <div
                class="rejected-heat"
                :data-level="waItem.level"
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
                    {{ waItem.description }}
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
