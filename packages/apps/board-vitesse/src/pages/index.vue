<script setup lang="ts">
import { useFetch, useVirtualList } from "@vueuse/core";
import { type ContestIndexList, createContestIndexList } from "@xcpcio/core";

const { t } = useI18n();

const url = ref(`${window.DATA_HOST}index/contest_list.json`);
const refetch = ref(false);

const contestIndexList = ref([] as ContestIndexList);

const { list, containerProps, wrapperProps } = useVirtualList(
  contestIndexList,
  {
    itemHeight: 64,
  },
);

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
  <div v-if="isFetching">
    {{ t("common.loading") }}...
  </div>

  <div v-if="isFinished">
    <div v-if="error">
      {{ error }}
    </div>

    <div v-bind="containerProps" style="height: calc(100vh - 128px)">
      <div v-bind="wrapperProps">
        <div v-for="item in list" :key="item.data.boardLink" style="height: 64px">
          {{ item.data.config.startTime.format("YYYY-MM-DD HH:mm:ss") }}<sup>{{ item.data.config.startTime.format("z") }}</sup>
          <br>
          {{ item.data.config.contestName }}
        </div>
      </div>
    </div>
  </div>
</template>
