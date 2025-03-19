<script setup lang="ts">
import { isAccepted, isRejected, type Rank } from "@xcpcio/core";

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

const submissions = computed(() => rank.value.getSubmissions());

const intervalDescriptions = Array.from({ length: mapTimeDiffLength }, (_, index) => {
  const start = index * intervalSize;
  const end = (index + 1) * intervalSize;
  return `Between ${start} and ${end} minutes: `;
});

const submissionsByProblemId = computed(() => {
  const result = new Map();

  rank.value.contest.problems.forEach((p) => {
    result.set(p.id, { correct: [], incorrect: [] });
  });

  submissions.value.forEach((s) => {
    const entry = result.get(s.problemId);
    if (!entry) {
      return;
    }

    if (isAccepted(s.status)) {
      entry.correct.push(s);
    } else if (isRejected(s.status)) {
      entry.incorrect.push(s);
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

function calcPreciseQuan(sortedValues: number[], p: number): number {
  if (sortedValues.length === 0) {
    return 0;
  }

  const position = (sortedValues.length - 1) * p;
  const index = Math.floor(position);
  const fraction = position - index;

  if (sortedValues[index + 1] !== undefined) {
    return sortedValues[index] + fraction * (sortedValues[index + 1] - sortedValues[index]);
  }

  return sortedValues[index];
}

function calcStaticThresholds(counts: number[]) {
  const nonZeroCounts = counts.filter(c => c > 0);

  if (nonZeroCounts.length === 0) {
    return [0, 0, 0, 0, 0];
  }

  const sorted = [...nonZeroCounts].sort((a, b) => a - b);

  return [
    0,
    calcPreciseQuan(sorted, 0.2),
    calcPreciseQuan(sorted, 0.4),
    calcPreciseQuan(sorted, 0.6),
    calcPreciseQuan(sorted, 0.8),
  ];
}

function getDynamicHeatLevel(value: number, thresholds: number[]): number {
  for (let i = thresholds.length - 1; i >= 0; i--) {
    if (value === 0) {
      return 0;
    } else if (value >= thresholds[i]) {
      return i;
    }
  }
  return 0;
}

const heatMapData = computed(() =>
  rank.value.contest.problems.map((p) => {
    const { correct, incorrect } = submissionsByProblemId.value.get(p.id)!;

    const correctHeatMap = generateHeatMap(correct, "correct");
    const incorrectHeatMap = generateHeatMap(incorrect, "incorrect");

    const correctCounts = correctHeatMap.map(i => i.count);
    const correctThresholds = calcStaticThresholds(correctCounts);

    const incorrectCounts = incorrectHeatMap.map(i => i.count);
    const incorrectThresholds = calcStaticThresholds(incorrectCounts);

    correctHeatMap.forEach(i => i.level = getDynamicHeatLevel(i.count, correctThresholds));
    incorrectHeatMap.forEach(i => i.level = getDynamicHeatLevel(i.count, incorrectThresholds));

    return {
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
          mb-1
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

        <div
          flex flex-row
          gap-1
        >
          <div
            v-for="(correctItem, index) in heatMap.correctHeatMap" :key="`correct-${index}`"
          >
            <HeatMapTooltip
              :content="correctItem.description"
              position="top"
            >
              <div
                :data-level="correctItem.level"
                class="correct-heat"
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
                    {{ correctItem.description }}
                  </div>
                </div>
              </template>
            </HeatMapTooltip>
          </div>
        </div>

        <div
          flex flex-row
          gap-1
        >
          <div
            v-for="(incorrectItem, index) in heatMap.incorrectHeatMap" :key="`incorrect-${index}`"
          >
            <HeatMapTooltip
              :content="incorrectItem.description"
              position="top"
            >
              <div
                :data-level="incorrectItem.level"
                class="incorrect-heat"
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
            </HeatMapTooltip>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="less">
@import "./SubmitHeatMap.less";
</style>
