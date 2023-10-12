<script setup lang="ts">
import { useRouteQuery } from "@vueuse/router";
import Board from "~/components/board/Board.vue";

const dataSourceUrlFromRouteQuery = useRouteQuery(
  "data-source",
  "",
  { transform: String },
);

const { t } = useI18n();

const dataSourceUrl = ref("");
const dataSourceUrlText = "Data Source URL";

const router = useRouter();
function go() {
  if (dataSourceUrl.value) {
    router.push(`/board/?data-source=${dataSourceUrl.value.trim()}`);
  }
}
</script>

<template>
  <div
    v-if="dataSourceUrlFromRouteQuery.length === 0"
    class="flex flex-col items-center"
  >
    <div
      w-128
    >
      <TheInput
        v-model="dataSourceUrl"
        w-full
        :placeholder="dataSourceUrlText"
        autocomplete="false"
        @keydown.enter="go"
      />
      <label class="hidden" for="input">
        {{ dataSourceUrlText }}
      </label>
    </div>

    <div py-2 />

    <div>
      <button
        m-3 text-sm btn
        :disabled="!dataSourceUrl"
        @click="go"
      >
        {{ t('button.go') }}
      </button>
    </div>
  </div>

  <div v-else>
    <Board
      :data-source-url="dataSourceUrlFromRouteQuery"
    />
  </div>
</template>

<route lang="yaml">
meta:
  layout: board-layout
</route>
