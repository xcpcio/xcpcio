<script setup lang="ts">
import { useFetch } from "@vueuse/core";
import { type ContestIndexList, createContestIndexList } from "@xcpcio/core";

const { t } = useI18n();

const url = ref(`${window.DATA_HOST}index/contest_list.json`);
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
  <div>
    <div v-if="isFetching">
      {{ t("common.loading") }}...
    </div>

    <div v-if="error">
      {{ error }}
    </div>

    <div v-if="isFinished && contestIndexList.length">
      <div v-for="item in contestIndexList" :key="item.boardLink">
        <ContestIndex :data="item" />
      </div>
    </div>
  </div>
</template>
