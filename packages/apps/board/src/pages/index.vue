<script setup lang="ts">
import { useFetch } from "@vueuse/core";
import { type ContestIndexList, createContestIndexList } from "@xcpcio/core";

const { t } = useI18n();

const now = ref(new Date());
const url = ref(`${window.DATA_HOST}index/contest_list.json?t=${now.value.getTime()}`);
const refetch = ref(false);
const contestIndexList = ref([] as ContestIndexList);

const {
  error,
  isFetching,
  isFinished,
} = useFetch(url, {
  refetch,
  afterFetch: (ctx) => {
    contestIndexList.value = createContestIndexList(JSON.parse(ctx.data));
    return ctx;
  },
}).get();
</script>

<template>
  <div
    sm:w-248
    lg:w-screen
  >
    <div>
      <div
        v-if="isFetching"
        w-screen
        flex justify-center
      >
        {{ t("common.loading") }}...
      </div>

      <div v-if="error">
        {{ error }}
      </div>

      <div
        v-if="isFinished && contestIndexList.length"
        sm:w-246
        lg:w-screen
        flex flex-col justify-center items-center
      >
        <div
          v-for="item in contestIndexList"
          :key="item.boardLink"
        >
          <ContestIndex
            :data="item"
          />
        </div>
      </div>
    </div>
  </div>
</template>
