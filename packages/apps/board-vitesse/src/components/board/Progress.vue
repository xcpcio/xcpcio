<script setup lang="ts">
import { ContestState } from "@xcpcio/types";
import { useRouteQuery } from "@vueuse/router";
import type { Rank, RankOptions } from "@xcpcio/core";
import { createDayJS, getTimeDiff } from "@xcpcio/core";

const props = defineProps<{
  width: number,
  state: ContestState,
  needScroll?: boolean,
  rank?: Rank,
  rankOptions?: RankOptions,
  elapsedTime?: string,
}>();
const emit = defineEmits(["update:rank-options"]);

const rankOptions = computed({
  get() {
    return props!.rankOptions;
  },
  set(value) {
    emit("update:rank-options", value);
  },
});

const barClass = computed(() => {
  switch (props.state) {
    case ContestState.PENDING:
      return "am-progress-bar-secondary";
    case ContestState.RUNNING:
      return "am-progress-bar-success";
    case ContestState.FROZEN:
      return "am-progress-bar-danger";
    case ContestState.FINISHED:
      return "am-progress-bar-primary";
  }
});

const pauseUpdate = ref(false);
const isDragging = ref(false);
const dragWidth = ref(0);
const barWidth = ref(props.width);
const barWidthPX = ref(0);
const progressRatio = useRouteQuery("progress-ratio", -1, { transform: Number });

const scroll = ref<HTMLElement>(null as unknown as HTMLElement);
const mask = ref<HTMLElement>(null as unknown as HTMLElement);
const bar = ref<HTMLElement>(null as unknown as HTMLElement);
const tooltip = ref<HTMLElement>(null as unknown as HTMLElement);
const tooltipInner = ref<HTMLElement>(null as unknown as HTMLElement);

function startDrag(event: MouseEvent) {
  isDragging.value = true;
  const leftVal = event.clientX - bar.value.offsetLeft;

  const updateProgress = (event: MouseEvent) => {
    if (!isDragging.value) {
      return;
    }

    pauseUpdate.value = true;

    let barLeft = event.clientX - leftVal;
    barLeft = Math.max(barLeft, 0);
    barLeft = Math.min(barLeft, scroll.value.offsetWidth - bar.value.offsetWidth);

    const maskWidth
            = scroll.value.offsetWidth * Number.parseInt(mask.value.style?.width) * 0.01;

    // When dragging beyond the current time bar,
    // then automatic updating resumes
    if (barLeft >= maskWidth) {
      barLeft = maskWidth;
      pauseUpdate.value = false;
    }

    let width = 0;
    if (barLeft > 0) {
      width = Math.round((barLeft + bar.value.offsetWidth) / (scroll.value.offsetWidth) * 10000);
    }

    if (width > 10000) {
      width = 10000;
    }

    if (width === 10000) {
      pauseUpdate.value = false;
    }

    window.getSelection()?.removeAllRanges();

    dragWidth.value = width;

    barWidthPX.value = barLeft;
    barWidth.value = width * 0.01;
  };

  const stopDrag = () => {
    document.removeEventListener("mouseup", stopDrag);
    document.removeEventListener("mousemove", updateProgress);

    isDragging.value = false;

    if (pauseUpdate.value === true) {
      progressRatio.value = dragWidth.value;
      rankOptions.value?.setWidth(dragWidth.value, props.rank!.contest);
    } else {
      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-expect-error
      progressRatio.value = undefined;
      rankOptions.value?.disableFilterSubmissionByTimestamp();
    }
  };

  document.addEventListener("mousemove", updateProgress);
  document.addEventListener("mouseup", stopDrag);
}

function getTimeScroll() {
  const startTime = props.rank!.contest.startTime;
  const endTime = props.rank!.contest.endTime;

  const gap = endTime.unix() - startTime.unix();
  const target = Math.floor(gap * barWidth.value * 0.01);

  const now = createDayJS();
  const limit = Math.max(0, Math.min(now.unix(), endTime.unix()) - startTime.unix());

  return getTimeDiff(Math.min(target, limit));
}

function elapsedTime() {
  if (pauseUpdate.value === true) {
    return getTimeScroll();
  }

  return props.elapsedTime;
}

function barWidthInStyle() {
  if (pauseUpdate.value === true) {
    return `${Math.max(0, barWidthPX.value)}px`;
  }

  return `max(calc(0%), min(calc(${props.width}%), calc(100% - 10px)))`;
}

onMounted(() => {
  scroll.value.onmouseenter = () => {
    tooltip.value.classList.add("in");
  };

  scroll.value.onmouseleave = () => {
    tooltip.value.classList.remove("in");
  };

  if (progressRatio.value !== -1) {
    pauseUpdate.value = true;
    dragWidth.value = Math.max(0, Math.min(10000, progressRatio.value));

    barWidth.value = dragWidth.value * 0.01;
    barWidthPX.value = barWidth.value * 0.01 * scroll.value.offsetWidth - bar.value.offsetWidth;

    rankOptions.value?.setWidth(progressRatio.value, props.rank!.contest);
  } else {
    rankOptions.value?.disableFilterSubmissionByTimestamp();
  }
});

onUnmounted(() => {});
</script>

<template>
  <div
    ref="scroll"
    class="am-progress am-progress-striped am-active"
    w-full
    :style="{
      position: 'relative',
    }"
  >
    <div
      ref="mask"
      class="am-progress-bar"
      :class="[barClass]"
      :style="{
        width: `${props.width}%`,
      }"
    >
      <template v-if="props.needScroll">
        <div
          ref="tooltip"
          class="tooltip tooltip-top"
          :style="{
            marginLeft: '-32px',
            bottom: '22px',
            left: barWidthInStyle(),
          }"
        >
          <div
            ref="tooltipInner"
            class="tooltip-inner"
          >
            {{ elapsedTime() }}
          </div>
        </div>

        <div
          ref="bar"
          class="am-progress-bar am-progress-cursor am-progress-scroll-size z-9999"
          :class="[barClass]"
          :style="{
            left: barWidthInStyle(),
          }"
          @mousedown="startDrag"
        />
      </template>
    </div>
  </div>
</template>

<style scoped lang="less">
@import "./Progress.less";

.am-progress-scroll-size {
  width: 10px;
  height: 25px;
}
</style>
