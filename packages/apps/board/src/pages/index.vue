<script setup lang="ts">
import { MultiSelect } from "vue-search-select";
import { useFetch } from "@vueuse/core";
import { createContestIndexList } from "@xcpcio/core";
import type { ContestIndexList, SelectOptionItem } from "@xcpcio/core";

const { t } = useI18n();

const now = ref(new Date());
const url = ref(`${window.DATA_HOST}index/contest_list.json?t=${now.value.getTime()}`);
const refetch = ref(false);
const contestIndexAllList = ref([] as ContestIndexList);
const contestIndexList = ref([] as ContestIndexList);

const contestOptions = ref([] as Array<SelectOptionItem>);
const contestSelectedOptions = ref([] as Array<SelectOptionItem>);

const {
  error,
  isFetching,
  isFinished,
} = useFetch(url, {
  refetch,
  afterFetch: (ctx) => {
    contestIndexAllList.value = createContestIndexList(JSON.parse(ctx.data));
    contestOptions.value = contestIndexAllList.value.map((c) => {
      return {
        value: c.contest.name,
        text: c.contest.name,
      };
    });

    contestIndexList.value = contestIndexAllList.value.map(c => c);

    return ctx;
  },
}).get();

function contestOnSelect(selectedItems: Array<SelectOptionItem>, _lastSelectItem: SelectOptionItem) {
  contestSelectedOptions.value = selectedItems;

  const se = new Set<string>();
  contestSelectedOptions.value.forEach((c) => {
    se.add(c.text);
  });

  contestIndexList.value = contestIndexAllList.value.filter((c) => {
    if (se.size === 0) {
      return true;
    }

    if (se.has(c.contest.name)) {
      return true;
    }

    return false;
  });
}
</script>

<template>
  <div
    class="sm:w-[1024px] lg:w-screen"
    lg:of-x-hidden
    flex flex-col justify-center items-center
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
        class="sm:w-[1000px] lg:w-screen min-h-120"
        flex flex-col items-center
      >
        <div
          w-240
        >
          <MultiSelect
            :options="contestOptions"
            :selected-options="contestSelectedOptions"
            @select="contestOnSelect"
          />
        </div>

        <div
          mt-4
        >
          <template
            v-for="item in contestIndexList"
            :key="item.boardLink"
          >
            <ContestIndex
              :data="item"
            />
          </template>
        </div>
      </div>
    </div>
  </div>
</template>

<route lang="yaml">
meta:
  layout: index-layout
</route>
