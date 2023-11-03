<script setup lang="ts">
import { createContest } from "@xcpcio/core";
import type { Contest } from "@xcpcio/core";
import { ContestState } from "@xcpcio/types";
import type { Contest as IContest } from "@xcpcio/types";

const props = defineProps<{
  dataSourceUrl: string,
}>();

const { t } = useI18n();
const title = useTitle(COUNTDOWN_TITLE_SUFFIX);

const now = ref(new Date());
const contest = ref({} as Contest);
const firstLoaded = ref(false);

const { data, isError, error } = useQueryBoardData(props.dataSourceUrl, now);
watch(data, async () => {
  if (data.value === null || data.value === undefined) {
    return;
  }

  contest.value = createContest(data.value?.contest as IContest);
  title.value = `${contest.value.name} | ${COUNTDOWN_TITLE_SUFFIX}`;

  firstLoaded.value = true;
});

const setNowIntervalId = setInterval(() => {
  now.value = new Date();
}, 1000);

onUnmounted(() => {
  clearInterval(setNowIntervalId);
});
</script>

<template>
  <div
    class="bg-[#323443]"
    text-gray-200
    w-screen
    h-screen
  >
    <div v-if="!firstLoaded">
      <div
        flex flex-col
        justify-center items-center
        w-screen h-screen
        text-xl italic
      >
        <div>
          {{ t("common.loading") }}...
        </div>

        <div v-if="isError">
          {{ error }}
        </div>
      </div>
    </div>

    <div
      v-else
    >
      <div
        flex flex-col
        items-center justify-center
      >
        <div
          mt-16
          text-6xl
        >
          {{ contest.name }}
        </div>

        <div
          mt-12
          text-6xl
        >
          {{ contest.getContestState(now) }}
        </div>

        <div
          mt-12
          class="text-[360px]"
        >
          <div
            v-if="contest.getContestState(now) === ContestState.PENDING"
            text-blue-500
          >
            {{ contest.getContestPendingTime(now) }}
          </div>

          <div
            v-else
          >
            {{ contest.getContestRemainingTime(now) }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
