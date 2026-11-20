<script setup lang="ts">
import type { ContestIndex } from "@xcpcio/core";
import type { Lang } from "@xcpcio/types";

import { getLogoFromPreset } from "@board/composables/logo";
import { useElementVisibility } from "@vueuse/core";

import { getImageSource } from "@xcpcio/core";

const props = defineProps<{
  data: ContestIndex;
}>();

const { t, locale } = useI18n();
const lang = computed(() => locale.value as unknown as Lang);

const contest = computed(() => props.data.contest);
const contestName = computed(() => contest.value.name.getOrDefault(lang.value));
const now = useNow();

const el = ref(null);
const isVisible = useElementVisibility(el);

const logo = computed(() => {
  if (!contest.value.logo) {
    return undefined;
  }

  return getLogoFromPreset(contest.value.logo);
});
</script>

<template>
  <div ref="el">
    <div class="min-h-32">
      <div
        v-if="isVisible"
      >
        <RouterLink
          :to="props.data.boardLink"
          class="flex w-full flex-col justify-center border-b-2 border-gray-200 pb-2 font-serif text-inherit dark:border-gray-700"
        >
          <div
            w-full flex
          >
            <div
              v-if="logo !== undefined"
              class="logo shrink-0"
            >
              <img
                class="h-10"
                :src="getImageSource(logo, DATA_HOST)"
                alt="logo"
                loading="lazy"
                decoding="async"
              >
            </div>

            <div
              class="title min-w-0 flex-1"
            >
              <Tooltip>
                <div
                  overflow-hidden
                  text-2xl truncate max-lg:text-xl
                >
                  {{ contestName }}
                </div>

                <template #popper>
                  <div
                    text-lg
                  >
                    {{ contestName }}
                  </div>
                </template>
              </Tooltip>
            </div>
          </div>

          <div class="flex items-end max-lg:flex-col max-lg:items-stretch max-lg:gap-2">
            <div class="float-left font-mono text-base max-lg:text-sm">
              {{ t("index.start") }}:
              {{ contest.startTime.format("YYYY-MM-DD HH:mm:ss") }}<sup class="pl-0.5">{{ contest.startTime.format("z") }}</sup>
              <br>
              {{ t("index.duration") }}:
              {{ contest.getContestDuration() }}
            </div>

            <div class="flex-1 max-lg:w-full">
              <div flex items-center justify-center>
                <div
                  font-bold font-mono
                  class="w-[68%] max-lg:w-full"
                >
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
            <div class="float-right max-lg:self-end">
              <span
                class="go MuiIconButton-root"
                aria-hidden="true"
              >
                <span class="MuiIconButton-label">
                  <RightArrowIcon />
                </span>
              </span>
            </div>
          </div>
        </RouterLink>
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
