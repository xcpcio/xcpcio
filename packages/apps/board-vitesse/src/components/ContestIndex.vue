<script setup lang="ts">
import type { ContestIndex } from "@xcpcio/core";
import type { Image } from "@xcpcio/types";

import { useElementVisibility } from "@vueuse/core";

const props = defineProps<{
  data: ContestIndex
}>();

const { t } = useI18n();

const contest = reactive(props.data.contest);
const now = ref(new Date());

const el = ref(null);
const isVisible = useElementVisibility(el);

function getImageSource(image: Image): string {
  if (image?.url) {
    return image.url;
  }

  if (image?.base64) {
    return `data:image/${image.type};base64,${image.base64}`;
  }

  return "";
}

const setNowIntervalId = setInterval(() => {
  now.value = new Date();
}, 1000);

onUnmounted(() => {
  clearInterval(setNowIntervalId);
});
</script>

<template>
  <div ref="el">
    <div h-32>
      <div v-if="isVisible">
        <div
          class="flex font-serif w-240 flex-col pb-2"
          border="b-2 gray-200 dark:gray-700"
        >
          <div class="w-full flex">
            <div v-if="contest.logo !== undefined" class="logo">
              <img class="h-10 w-10" :src="getImageSource(contest.logo)" alt="logo">
            </div>

            <VTooltip class="w-inherit">
              <div class="title overflow-hidden truncate text-2xl">
                {{ contest.name }}
              </div>

              <template #popper>
                {{ contest.name }}
              </template>
            </VTooltip>
          </div>

          <div class="flex items-end">
            <div class="float-left font-mono text-base">
              {{ t("index.start") }}:
              {{ contest.startTime.format("YYYY-MM-DD HH:mm:ss") }}<sup class="pl-0.5">{{ contest.startTime.format("z") }}</sup>
              <br>
              {{ t("index.duration") }}:
              {{ contest.getContestDuration() }}
            </div>
            <div class="flex-1">
              <div class="flex items-center justify-center">
                <div class="font-bold font-mono w-[68%]">
                  <div>
                    <ContestStateBadge
                      :state="contest.getContestState(now)"
                      :pending-time="contest.getContestPendingTime(now)"
                    />
                  </div>
                  <Progress
                    :width="contest.getContestProgressRatio(now)"
                    :state="contest.getContestState(now)"
                  />
                </div>
              </div>
            </div>
            <div class="float-right">
              <RouterLink
                class="go MuiIconButton-root"
                :to="props.data.boardLink"
              >
                <span class="MuiIconButton-label">
                  <RightArrowIcon />
                </span>
              </RouterLink>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.logo {
  float: left;
  text-align: left;
  font-size: 16px;
  padding-top: 12px;
  padding-right: 8px;
}

.title {
  --scroll-bar: 0;
  font-variant: tabular-nums;
  line-height: 1.5715;
  box-sizing: border-box;
  position: relative;
  text-align: left;
  font-weight: 400;
  padding-left: 0px;
  padding-right: 16px;
  padding-top: 12px;
  padding-bottom: 12px;
}

.MuiIconButton-root {
  -webkit-font-smoothing: antialiased;
  font-weight: 400;
  line-height: 1.43;
  letter-spacing: 0.01071em;
  box-sizing: inherit;
  border: 0;
  cursor: pointer;
  margin: 0;
  display: inline-flex;
  outline: 0;
  position: relative;
  align-items: center;
  user-select: none;
  vertical-align: middle;
  justify-content: center;
  text-decoration: none;
  background-color: transparent;
  -webkit-tap-highlight-color: transparent;
  flex: 0 0 auto;
  color: rgba(0, 0, 0, 0.54);
  padding: 12px;
  overflow: visible;
  font-size: 1.5rem;
  text-align: center;
  transition: background-color 150ms cubic-bezier(0.4, 0, 0.2, 1) 0ms;
  border-radius: 50%;
}

.MuiIconButton-label {
  -webkit-font-smoothing: antialiased;
  font-family: "Roboto", "Helvetica", "Arial", sans-serif;
  font-weight: 400;
  line-height: 1.43;
  letter-spacing: 0.01071em;
  cursor: pointer;
  user-select: none;
  -webkit-tap-highlight-color: transparent;
  color: rgba(0, 0, 0, 0.54);
  font-size: 1.5rem;
  text-align: center;
  box-sizing: inherit;
  width: 100%;
  display: flex;
  align-items: inherit;
  justify-content: inherit;
}

.go {
  text-decoration: none;
  color: #121314;
  position: relative;
}

.go:after {
  content: "";
  position: absolute;
  z-index: -1;
  top: 60%;
  left: -0.1em;
  right: -0.1em;
  bottom: 0;
  transition: top 200ms cubic-bezier(0, 0.8, 0.13, 1);
  background-color: #91d5ff;
}

.go:hover:after {
  top: 0%;
}

.loading {
  height: calc(100vh);
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
