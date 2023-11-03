<script setup lang="ts">
import { useFetch } from "@vueuse/core";
import { useRouteQuery } from "@vueuse/router";

import { createContestIndexList } from "@xcpcio/core";
import type { ContestIndexList } from "@xcpcio/core";

import { TITLE_SUFFIX } from "~/composables/constant";
import SearchInput from "~/components/SearchInput.vue";
import ContestIndexUI from "~/components/ContestIndexUI.vue";

const { t } = useI18n();
useTitle(TITLE_SUFFIX);

const now = ref(new Date());
const url = ref(`${window.DATA_HOST}index/contest_list.json?t=${now.value.getTime()}`);
const refetch = ref(false);

const s = useRouteQuery<string | null>("s", "", { transform: String });
const searchText = ref<string | null>(s.value);
const searchInputRef = ref<InstanceType<typeof SearchInput> | null>(null);

const contestIndexAllList = ref([] as ContestIndexList);
const contestIndexList = ref([] as ContestIndexList);

function onSearch() {
  contestIndexList.value = contestIndexAllList.value.filter((c) => {
    if (searchText.value?.length === 0) {
      searchText.value = null;
    }

    if (searchText.value === null) {
      s.value = undefined as unknown as string;
      return true;
    }

    s.value = searchText.value;

    if (c.contest.name.includes(searchText.value)
        || c.contest.name.toLowerCase().includes(searchText.value.toLowerCase())
        || c.boardLink.toLocaleLowerCase().includes(searchText.value.toLowerCase())) {
      return true;
    }

    return false;
  });
}

function clearSearch() {
  searchText.value = null;
  searchInputRef.value?.focus();
}

const {
  error,
  isFetching,
  isFinished,
} = useFetch(url, {
  refetch,
  afterFetch: (ctx) => {
    contestIndexAllList.value = createContestIndexList(JSON.parse(ctx.data));
    contestIndexList.value = contestIndexAllList.value.map(c => c);
    onSearch();

    return ctx;
  },
}).get();

watch(searchText, () => {
  onSearch();
});
</script>

<template>
  <div
    class="sm:w-[1024px] lg:w-screen"
    lg:of-x-hidden
    flex flex-col justify-center items-center
  >
    <div>
      <div
        v-if="isFetching || error"
        mt-4 mb-4
        class="sm:w-[1000px] lg:w-screen"
        flex justify-center items-center
      >
        <div
          v-if="isFetching"
        >
          {{ t("common.loading") }}...
        </div>

        <div
          v-if="error"
        >
          {{ error }}
        </div>
      </div>

      <div
        v-if="isFinished"
        class="sm:w-[1000px] lg:w-screen min-h-120"
        flex flex-col items-center
      >
        <div w-240>
          <SearchInput
            ref="searchInputRef"
            v-model="searchText"
          />
        </div>

        <div
          v-if="contestIndexList.length"
          mt-4
        >
          <template
            v-for="item in contestIndexList"
            :key="item.boardLink"
          >
            <ContestIndexUI
              :data="item"
            />
          </template>
        </div>

        <div v-else p10>
          <div op40 italic mb5>
            No result found
          </div>
          <div row justify-center>
            <button
              btn
              @click="clearSearch()"
            >
              Clear search
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<route lang="yaml">
meta:
  layout: index-layout
</route>
