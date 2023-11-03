<script setup lang="ts">
import { createContest } from "@xcpcio/core";
import type { Contest } from "@xcpcio/core";
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
        w-screen
        h-screen
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
        justify-between
      >
        {{ contest.name }}
      </div>
    </div>
  </div>
</template>
