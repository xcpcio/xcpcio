<script setup lang="ts">
import type { IRatingIndex } from "@xcpcio/types";

import { useFetch } from "@vueuse/core";

const { t } = useI18n();
useTitle(RATING_TITLE_SUFFIX);

function genURL() {
  return `${RATING_DATA_HOST.value}index/index.json`;
}
const url = ref(genURL());
const indexList = ref([] as IRatingIndex[]);

const {
  error,
  isFetching,
  isFinished,
} = useFetch(url, {
  refetch: true,
  afterFetch: (ctx) => {
    indexList.value = JSON.parse(ctx.data) as IRatingIndex[];
    return ctx;
  },
}).get();
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
        <div
          v-if="indexList.length"
          mt-4
        >
          <template
            v-for="item in indexList"
            :key="item.id"
          >
            <RatingIndexUI
              :rating-index="item"
            />
          </template>
        </div>

        <div v-else p10>
          <div op40 italic mb5>
            No result found
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
