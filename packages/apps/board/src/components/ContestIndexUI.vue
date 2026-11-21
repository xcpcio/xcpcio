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
            class="flex w-full max-lg:items-center"
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
                  class="text-2xl max-lg:text-lg max-lg:break-words lg:truncate"
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

          <div class="w-full">
            <div class="font-mono text-base max-lg:text-sm">
              <div>
                {{ t("index.start") }}:
                {{ contest.startTime.format("YYYY-MM-DD HH:mm:ss") }}<sup class="pl-0.5">{{ contest.startTime.format("z") }}</sup>
              </div>

              <div class="flex items-end justify-between gap-3">
                <div>
                  {{ t("index.duration") }}:
                  {{ contest.getContestDuration() }}
                </div>

                <div class="shrink-0 font-bold">
                  <ContestStateBadge
                    :state="contest.getContestState(now)"
                    :pending-time="contest.getContestPendingTime(now)"
                  />
                </div>
              </div>
            </div>

            <div class="mt-1 w-full font-bold font-mono">
              <Progress
                :width="contest.getContestProgressRatio(now)"
                :state="contest.getContestState(now)"
              />
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

@media (max-width: 1023.98px) {
  .logo {
    padding-top: 0;
  }
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

.loading {
  height: calc(100vh);
  display: flex;
  justify-content: center;
  align-items: center;
}
</style>
