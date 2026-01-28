<script setup lang="ts">
import type { Rank, Submission } from "@xcpcio/core";
import { isAccepted, isRejected } from "@xcpcio/core";
import "./SubmitHeatMap.less";

const props = defineProps<{
  rank: Rank;
}>();

const { t } = useI18n();

const rank = computed(() => props.rank);
const submissions = computed(() => rank.value.getSubmissions());

const mapTimeDiffLength = 20;

const intervalSize = computed(() => {
  const startTime = rank.value.contest.getStartTime();
  const endTime = rank.value.contest.getEndTime();
  const totalDuration = endTime.diff(startTime, "minute");

  if (!Number.isFinite(totalDuration) || totalDuration <= 0) {
    return 1;
  }

  return totalDuration / mapTimeDiffLength;
});

const intervalDescriptions = computed(() =>
  Array.from({ length: mapTimeDiffLength }, (_, index) => {
    const start = index * intervalSize.value;
    const end = (index + 1) * intervalSize.value;
    return `Between ${start} and ${end} minutes: `;
  }),
);

const submissionsByProblemId = computed(() => {
  const result = new Map<string, { correct: Submission[]; incorrect: Submission[] }>();

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

function generateHeatMap(submissions: Submission[], type: "correct" | "incorrect") {
  const counts = Array.from<number>({ length: mapTimeDiffLength }).fill(0);
  const size = intervalSize.value > 0 ? intervalSize.value : 1;
  const descriptions = intervalDescriptions.value;

  submissions.forEach((s) => {
    const index = Math.min(Math.floor(s.timestampToMinute / size), mapTimeDiffLength - 1);
    counts[index]++;
  });

  return counts.map((count, i) => ({
    count,
    level: 0,
    description: `${descriptions[i]}${count} ${type} submissions`,
  }));
}

function getHeatLevel(value: number, maxValue: number): number {
  if (value <= 0 || maxValue <= 0) {
    return 0;
  }

  const level = Math.ceil((value / maxValue) * 4);
  return Math.min(Math.max(level, 1), 4);
}

const heatMapData = computed(() =>
  rank.value.contest.problems.map((p) => {
    const { correct, incorrect } = submissionsByProblemId.value.get(p.id)!;

    const correctHeatMap = generateHeatMap(correct, "correct");
    const incorrectHeatMap = generateHeatMap(incorrect, "incorrect");

    const correctCounts = correctHeatMap.map(i => i.count);
    const correctMax = Math.max(0, ...correctCounts);

    const incorrectCounts = incorrectHeatMap.map(i => i.count);
    const incorrectMax = Math.max(0, ...incorrectCounts);

    correctHeatMap.forEach(i => i.level = getHeatLevel(i.count, correctMax));
    incorrectHeatMap.forEach(i => i.level = getHeatLevel(i.count, incorrectMax));

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
      grid grid-cols-4
      gap-6 space-y-0
      place-items-center
    >
      <div
        v-for="heatMap in heatMapData" :key="heatMap.label"
        class="w-280px h-100px"
        flex flex-col gap-2
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
          gap-0.5
        >
          <div
            v-for="(correctItem, index) in heatMap.correctHeatMap" :key="`correct-${index}`"
          >
            <Tooltip>
              <div
                :data-level="correctItem.level"
                class="correct-heat"
                size-10px
                rounded-0.7
                bg-gray-200 dark:bg-gray-700
              />
              <template #popper>
                {{ correctItem.description }}
              </template>
            </Tooltip>
          </div>
        </div>

        <div
          flex flex-row
          gap-0.5
        >
          <div
            v-for="(incorrectItem, index) in heatMap.incorrectHeatMap" :key="`incorrect-${index}`"
          >
            <Tooltip>
              <div
                :data-level="incorrectItem.level"
                class="incorrect-heat"
                size-10px
                rounded-0.7
                bg-gray-200 dark:bg-gray-700
              />
              <template #popper>
                {{ incorrectItem.description }}
              </template>
            </Tooltip>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
