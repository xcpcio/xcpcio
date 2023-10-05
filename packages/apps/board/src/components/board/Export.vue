<script setup lang="ts">
import type { Rank } from "@xcpcio/core";
import { rankToCodeforcesGymDAT } from "@xcpcio/core";
import { ModelSelect } from "vue-search-select";
import { useToast } from "vue-toast-notification";
import FileSaver from "file-saver";

const props = defineProps<{
  rank: Rank,
}>();

const $toast = useToast();

const { copy, isSupported } = useClipboard();

const rank = computed(() => props.rank);

const currentItem = ref({ value: "cf-dat", text: "Codeforces Gym Ghost(dat)" });
const options = ref([
  { value: "cf-dat", text: "Codeforces Gym Ghost(dat)" },
]);

function onClickForCfDatDownload() {
  const dat = rankToCodeforcesGymDAT(rank.value);
  const blob = new Blob([dat], { type: "text/plain;charset=utf-8" });
  FileSaver.saveAs(blob, "contest.dat");
}

function onClickForCfDatCopyToClipboard() {
  if (!isSupported.value) {
    $toast.warning("clipboard is not supported");
    return;
  }

  const dat = rankToCodeforcesGymDAT(rank.value);
  copy(dat);

  $toast.success("Copy Success");
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
        btn
        @click="onClickForCfDatCopyToClipboard()"
      >
        Copy to Clipboard
      </button>
    </div>
  </div>
</template>
