<script setup lang="ts">
import { ModelSelect } from "vue-search-select";
import type { Rank } from "@xcpcio/core";
import { rankToCodeforcesGymDAT } from "@xcpcio/core";

const props = defineProps<{
  rank: Rank,
}>();

const rank = computed(() => props.rank);

const currentItem = ref({ value: "cf-dat", text: "Codeforces Gym Ghost(dat)" });

const { copy, isSupported } = useClipboard();

const options = ref([
  { value: "cf-dat", text: "Codeforces Gym Ghost(dat)" },
]);

function onClickForCfDatDownload() {
  const dat = rankToCodeforcesGymDAT(rank.value);
  downloadSingleFile(dat, "contest.dat");
}

function onClickForCfDatCopyToClipboard() {
  const dat = rankToCodeforcesGymDAT(rank.value);
  copy(dat);
}
</script>

<template>
  <div
    flex flex-col
  >
    <div
      w-160
      font-bold
    >
      <ModelSelect
        v-model="currentItem"
        :options="options"
        placeholder="Export Type"
      />
    </div>

    <div
      v-if="currentItem.value === 'cf-dat'"
      mt-8
      flex flex-row justify-center gap-4
    >
      <button
        btn
        @click="onClickForCfDatDownload()"
      >
        Download
      </button>

      <button
        v-if="isSupported"
        btn
        @click="onClickForCfDatCopyToClipboard()"
      >
        Copy to Clipboard
      </button>
    </div>
  </div>
</template>
