<script setup lang="ts">
import type { ContestIndexList } from "@xcpcio/core";
import type { Lang } from "@xcpcio/types";

import ContestIndexUI from "@board/components/ContestIndexUI.vue";
import SearchInput from "@board/components/SearchInput.vue";
import { DATA_HOST } from "@board/composables/constant";

import { useFetch } from "@vueuse/core";
import { createContestIndexList } from "@xcpcio/core";

const INDEX_TITLE = "ICPC Series Competition Leaderboard - XCPCIO";
const INDEX_HEADING = "ICPC Series Competition Leaderboard";

const { t, locale } = useI18n();
const lang = computed(() => locale.value as unknown as Lang);

useTitle(INDEX_TITLE);

const FETCH_INTERVAL = 1000 * 60 * 5;
const now = useNow();
const nowMinutes = computed(() => Math.floor(now.value.getTime() / FETCH_INTERVAL));

function genURL() {
  return `${DATA_HOST.value}index/contest_list.json?t=${nowMinutes.value}`;
}
const url = ref(genURL());

const s = useQueryForSearch();
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

    if (c.contest.name.getOrDefault(lang.value).includes(searchText.value)
      || c.contest.name.getOrDefault(lang.value).toLowerCase().includes(searchText.value.toLowerCase())
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
  refetch: true,
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

const fetchIntervalId = setInterval(() => {
  url.value = genURL();
}, FETCH_INTERVAL);

onUnmounted(() => {
  clearInterval(fetchIntervalId);
});
</script>

<template>
  <div
    class="w-full"
    lg:of-x-hidden
    flex flex-col justify-center items-center
  >
    <h1 class="sr-only">
      {{ INDEX_HEADING }}
    </h1>

    <div class="w-full">
      <div
        v-if="isFetching || error"
        mt-4 mb-4
        class="w-full"
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
        class="w-full min-h-120"
        flex flex-col items-center
      >
        <div class="w-full max-w-[62rem] px-4 lg:max-w-[60rem] lg:px-0">
          <SearchInput
            ref="searchInputRef"
            v-model="searchText"
          />
        </div>

        <div
          v-if="contestIndexList.length"
          class="mt-4 w-full max-w-[62rem] px-4 lg:max-w-[60rem] lg:px-0"
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
