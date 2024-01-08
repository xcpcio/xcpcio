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

const now = useNow();
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
</script>

<template>
  <div
    class="background"
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
        font-mono
      >
        <div
          mt-20
          text-6xl
          :class="[contest.getContestState(now).toString()]"
        >
          {{ contest.getContestState(now) }}
        </div>

        <div
          mt-20
          class="text-[320px]"
          :class="[contest.getContestState(now).toString()]"
        >
          <div
            v-if="contest.getContestState(now) === ContestState.PENDING"
          >
            {{ contest.getContestPendingTime(now) }}
          </div>

          <div
            v-else
          >
            {{ contest.getContestElapsedTime(now) }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.background {
  background-color: #333443;
}

.PENDING {
  color: #3bb4f2;
}

.RUNNING {
  color: rgb(94, 185, 94);
}

.FROZEN {
  color: #dd514c;
}

.FINISHED {
  color: #0e90d2;
}

.PAUSED {
  color: #3bb4f2;
}
</style>
