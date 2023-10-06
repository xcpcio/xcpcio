<script setup lang="ts">
import type { Rank } from "@xcpcio/core";
import { CodeforcesGymGhostDATConverter, GeneralExcelConverter } from "@xcpcio/core";
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
  {
    value: "cf-dat",
    text: "Codeforces Gym Ghost(dat)",
  },
  {
    value: "general-xlsx",
    text: "Excel Table(xlsx)",
  },
]);

function onClickForCfDatDownload() {
  const converter = new CodeforcesGymGhostDATConverter();
  const dat = converter.convert(rank.value);
  const blob = new Blob([dat], { type: "text/plain;charset=utf-8" });
  FileSaver.saveAs(blob, "contest.dat");
}

function onClickForCfDatCopyToClipboard() {
  if (!isSupported.value) {
    $toast.warning("clipboard is not supported");
    return;
  }

  const converter = new CodeforcesGymGhostDATConverter();
  const dat = converter.convert(rank.value);
  copy(dat);

  $toast.success("Copy Success");
}

function onClickForGeneralXLSXDownload() {
  const converter = new GeneralExcelConverter();
  converter.convertAndWrite(rank.value, `${rank.value.contest.name}.xlsx`);
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
      mt-8
    >
      <div
        v-if="currentItem.value === 'cf-dat'"
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

      <div
        v-if="currentItem.value === 'general-xlsx'"
        flex justify-center
      >
        <button
          btn
          @click="onClickForGeneralXLSXDownload()"
        >
          Download
        </button>
      </div>
    </div>
  </div>
</template>
