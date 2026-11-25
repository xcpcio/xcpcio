<script setup lang="ts">
import type { ContestIndexList } from "@xcpcio/core";
import type { Lang } from "@xcpcio/types";

import ContestIndexUI from "@board/components/ContestIndexUI.vue";
import IndexBrowseDrawer from "@board/components/IndexBrowseDrawer.vue";
import SearchInput from "@board/components/SearchInput.vue";
import { DATA_HOST } from "@board/composables/constant";
import {
  buildIndexBreadcrumbs,
  collectIndexDirectoryPaths,
  filterContestIndexByPrefix,
  formatIndexPathLabel,
  getIndexChildDirectories,
  markIndexPaths,
  normalizeIndexPath,
} from "@board/composables/indexPage";
import { getRoutingMode } from "@board/composables/routing";

import { useFetch } from "@vueuse/core";
import { createContestIndexList } from "@xcpcio/core";

const props = defineProps<{
  pathPrefix?: string;
}>();

const INDEX_TITLE = "ICPC Series Competition Leaderboard - XCPCIO";
const INDEX_HEADING = "ICPC Series Competition Leaderboard";
const FETCH_INTERVAL = 1000 * 60 * 5;

const { t, locale } = useI18n();
const lang = computed(() => locale.value as unknown as Lang);

const normalizedPrefix = computed(() => normalizeIndexPath(props.pathPrefix));
const isDirectoryPage = computed(() => normalizedPrefix.value !== "/");
// Directory routes only exist on board_server deployments; static deployments
// expose the whole list at "/" and open boards through /board/?data-source=.
const isQueryRouting = getRoutingMode() === "query";
const displayLabel = computed(() => formatIndexPathLabel(normalizedPrefix.value));
const breadcrumbs = computed(() => buildIndexBreadcrumbs(normalizedPrefix.value));

const title = computed(() => {
  return isDirectoryPage.value
    ? `${displayLabel.value} - XCPCIO`
    : INDEX_TITLE;
});
useTitle(title);

const s = useQueryForSearch();
const searchText = ref<string | null>(s.value);
const searchInputRef = ref<InstanceType<typeof SearchInput> | null>(null);

function clearSearch() {
  searchText.value = null;
  searchInputRef.value?.focus();
}

watch(searchText, (value) => {
  if (value?.length === 0) {
    searchText.value = null;
    return;
  }

  s.value = (value ?? undefined) as unknown as string;
});

watch(normalizedPrefix, (prefix) => {
  if (searchText.value !== null) {
    searchText.value = null;
  }

  markIndexPaths(buildIndexBreadcrumbs(prefix).map(crumb => crumb.path));
});

markIndexPaths(buildIndexBreadcrumbs(normalizedPrefix.value).map(crumb => crumb.path));

const now = useNow();
const nowMinutes = computed(() => Math.floor(now.value.getTime() / FETCH_INTERVAL));

function genURL() {
  return `${DATA_HOST.value}index/contest_list.json?t=${nowMinutes.value}`;
}

const url = ref(genURL());
const contestIndexAllList = ref<ContestIndexList>([]);

const {
  error,
  isFetching,
  isFinished,
} = useFetch(url, {
  refetch: true,
  afterFetch: (ctx) => {
    const list = createContestIndexList(JSON.parse(ctx.data));
    contestIndexAllList.value = list;
    markIndexPaths(collectIndexDirectoryPaths(list));

    return ctx;
  },
}).get();

const fetchIntervalId = setInterval(() => {
  url.value = genURL();
}, FETCH_INTERVAL);

onUnmounted(() => {
  clearInterval(fetchIntervalId);
});

const scopedContestIndexList = computed(() => {
  return filterContestIndexByPrefix(contestIndexAllList.value, normalizedPrefix.value);
});

const contestIndexList = computed(() => {
  const query = searchText.value;
  if (!query) {
    return scopedContestIndexList.value;
  }

  return scopedContestIndexList.value.filter((item) => {
    const name = item.contest.name.getOrDefault(lang.value);
    return name.includes(query)
      || name.toLowerCase().includes(query.toLowerCase())
      || item.boardLink.toLowerCase().includes(query.toLowerCase());
  });
});

const childDirectories = computed(() => {
  return getIndexChildDirectories(contestIndexAllList.value, normalizedPrefix.value);
});

const isUnknownScope = computed(() => {
  return isDirectoryPage.value && scopedContestIndexList.value.length === 0;
});
</script>

<template>
  <div
    class="w-full"
    lg:of-x-hidden
    flex flex-col justify-center items-center
  >
    <h1 class="sr-only">
      {{ isDirectoryPage ? displayLabel : INDEX_HEADING }}
    </h1>

    <div class="w-full">
      <div
        v-if="isFetching || error"
        mt-4 mb-4
        class="w-full"
        flex justify-center items-center
      >
        <div v-if="isFetching">
          {{ t("common.loading") }}...
        </div>

        <div v-if="error">
          {{ error }}
        </div>
      </div>

      <div
        v-if="isFinished && !error"
        class="w-full min-h-120"
        flex flex-col items-center
      >
        <template v-if="isUnknownScope">
          <div class="mt-10 flex flex-col items-center gap-2">
            <div text-4xl>
              <div i-carbon-warning />
            </div>
            {{ t("not-found") }}
            <GoBack />
          </div>
        </template>

        <template v-else>
          <div
            v-if="isDirectoryPage"
            class="flex w-full max-w-[62rem] items-baseline justify-between gap-3 px-4 text-sm op60 lg:mt-9 lg:max-w-[60rem] lg:px-0"
          >
            <nav
              class="flex min-w-0 flex-1 flex-wrap items-baseline gap-x-2 gap-y-1"
              aria-label="Breadcrumb"
            >
              <RouterLink class="text-inherit hover:underline" to="/">
                {{ t("index.all_contests") }}
              </RouterLink>

              <template
                v-for="(crumb, index) in breadcrumbs"
                :key="crumb.path"
              >
                <span aria-hidden="true">/</span>
                <RouterLink
                  v-if="index < breadcrumbs.length - 1"
                  class="text-inherit hover:underline"
                  :to="crumb.path"
                >
                  {{ crumb.label }}
                </RouterLink>
                <span v-else class="op100">{{ crumb.label }}</span>
              </template>
            </nav>

            <div class="shrink-0 font-mono">
              {{ t("index.contest_count", { count: scopedContestIndexList.length }) }}
            </div>
          </div>

          <div
            class="w-full max-w-[62rem] px-4 lg:max-w-[60rem] lg:px-0"
            :class="{ 'mt-3': isDirectoryPage }"
          >
            <SearchInput
              ref="searchInputRef"
              v-model="searchText"
            />
          </div>

          <IndexBrowseDrawer
            v-if="childDirectories.length && !isQueryRouting"
            class="mt-4 flex w-full max-w-[62rem] px-4 lg:max-w-[60rem] lg:px-0"
            :directories="childDirectories"
            :breadcrumbs="breadcrumbs"
          />

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
        </template>
      </div>
    </div>
  </div>
</template>
