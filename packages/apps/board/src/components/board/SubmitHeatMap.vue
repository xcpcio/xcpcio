<script setup lang="ts">
import type { Rank } from "@xcpcio/core";
import { SubmissionStatus } from "@xcpcio/types";

const props = defineProps<{
  rank: Rank;
}>();

const rank = computed(() => props.rank);
const startTime = rank.value.contest.getStartTime();
const endTime = rank.value.contest.getEndTime();
const totalDuration = endTime.diff(startTime, "minute");
const intervalSize = totalDuration / 20;

const submissions = computed(() => rank.value.getSubmissions());
const accepted = computed(() => submissions.value.filter(s => s.status === SubmissionStatus.ACCEPTED));
const rejected = computed(() => submissions.value.filter(s => s.status === SubmissionStatus.WRONG_ANSWER));

function getHeatMapData() {
  const h = [];

  for (const p of rank.value.contest.problems) {
    const acSubmits = accepted.value.filter(s => s.problemId === p.id);
    const waSubmits = rejected.value.filter(s => s.problemId === p.id);
    const acHeatMap = Array.from({ length: 20 }, () => ({ count: 0, description: "" }));
    const waHeatMap = Array.from({ length: 20 }, () => ({ count: 0, description: "" }));

    acHeatMap.forEach((a, index) => {
      a.description = `Between ${index * intervalSize} and ${(index + 1) * intervalSize} minutes: 0 correct submissions`;
    });

    waHeatMap.forEach((w, index) => {
      w.description = `Between ${index * intervalSize} and ${(index + 1) * intervalSize} minutes: 0 rejected submissions`;
    });

    for (const s of acSubmits) {
      const duration = s.timestampToMinute;
      const index = Math.min(Math.floor(duration / intervalSize), 19);
      acHeatMap[index].count++;
      acHeatMap[index].description = `Between ${index * intervalSize} and ${(index + 1) * intervalSize} minutes: ${acHeatMap[index].count} correct submissions`;
    }

    for (const s of waSubmits) {
      const duration = s.timestampToMinute;
      const index = Math.min(Math.floor(duration / intervalSize), 19);
      waHeatMap[index].count++;
      waHeatMap[index].description = `Between ${index * intervalSize} and ${(index + 1) * intervalSize} minutes: ${waHeatMap[index].count} rejected submissions`;
    }

    h.push({
      id: p.id,
      label: p.label,
      balloonColor: p.balloonColor,
      acHeatMap,
      waHeatMap,
    });
  }
  return h;
}

function getHeatLevel(count: number) {
  if (count === 0) {
    return "0";
  } else if (count <= 50) {
    return "1";
  } else if (count <= 100) {
    return "2";
  } else if (count <= 200) {
    return "3";
  } else {
    return "4";
  }
}
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
        v-for="heatMap in getHeatMapData()" :key="heatMap.label"
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
              v-for="index in 20" :key="`ac-${index}`"
              w-inherit
            >
              <div
                class="accept-heat"
                :data-level="getHeatLevel(heatMap.acHeatMap[index - 1].count)"
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
                    {{ heatMap.acHeatMap[index - 1].description }}
                  </div>
                </div>
              </template>
            </Tooltip>
          </div>

          <div flex flex-row gap-1>
            <Tooltip v-for="index in 20" :key="`wa-${index}`" w-inherit>
              <div
                class="rejected-heat"
                :data-level="getHeatLevel(heatMap.waHeatMap[index - 1].count)"
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
                    {{ heatMap.waHeatMap[index - 1].description }}
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
