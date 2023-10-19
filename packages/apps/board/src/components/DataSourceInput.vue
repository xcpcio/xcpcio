<script setup lang="ts">
import { getDataSourceUrl } from "~/composables/query";

const { t } = useI18n();

const dataSourceUrl = getDataSourceUrl();
const dataSourceUrlText = "Data Source URL";
const dataSourceUrlInput = ref(dataSourceUrl.value);

const route = useRoute();
const router = useRouter();
function go() {
  router.push(`${route.fullPath}/?data-source=${dataSourceUrlInput.value.trim()}`);
}
</script>

<template>
  <div
    v-if="dataSourceUrl.length === 0"
    class="flex flex-col items-center"
  >
    <div
      w-128
    >
      <TheInput
        v-model="dataSourceUrlInput"
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
        :disabled="dataSourceUrlInput.length === 0"
        @click="go"
      >
        {{ t('button.go') }}
      </button>
    </div>
  </div>
</template>
