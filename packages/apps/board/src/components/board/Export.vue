<script setup lang="ts">
import { ModelSelect } from "vue-search-select";
import { useToast } from "vue-toast-notification";
import FileSaver from "file-saver";
import sleep from "sleep-promise";

import type { Rank } from "@xcpcio/core";
import { CodeforcesGymGhostDATConverter, GeneralExcelConverter } from "@xcpcio/core";

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

const btnDisable = ref({
  CfDatDownload: false,
  CfDatCopy: false,
  GeneralXLSXDownload: false,
});

async function waitDisabled() {
  await nextTick();
  await sleep(16);
}

async function onClickForCfDatDownload() {
  btnDisable.value.CfDatDownload = true;
  await waitDisabled();

  const converter = new CodeforcesGymGhostDATConverter();
  const dat = converter.convert(rank.value);
  const blob = new Blob([dat], { type: "text/plain;charset=utf-8" });
  FileSaver.saveAs(blob, "contest.dat");

  btnDisable.value.CfDatDownload = false;
}

async function onClickForCfDatCopyToClipboard() {
  if (!isSupported.value) {
    $toast.warning("clipboard is not supported");
    return;
  }

  btnDisable.value.CfDatCopy = true;
  await waitDisabled();

  const converter = new CodeforcesGymGhostDATConverter();
  const dat = converter.convert(rank.value);
  copy(dat);

  btnDisable.value.CfDatCopy = false;
  $toast.success("Copy Success");
}

async function onClickForGeneralXLSXDownload() {
  btnDisable.value.GeneralXLSXDownload = true;
  await waitDisabled();

  const converter = new GeneralExcelConverter();
  converter.convertAndWrite(rank.value, `${rank.value.contest.name}.xlsx`);

  btnDisable.value.GeneralXLSXDownload = false;
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
          :disabled="btnDisable.CfDatDownload"
          btn
          @click="onClickForCfDatDownload"
        >
          Download
        </button>

        <button
          :disabled="btnDisable.CfDatCopy"
          btn
          @click="onClickForCfDatCopyToClipboard"
        >
          Copy to Clipboard
        </button>
      </div>

      <div
        v-if="currentItem.value === 'general-xlsx'"
        flex justify-center
      >
        <button
          :disabled="btnDisable.GeneralXLSXDownload"
          btn
          @click="onClickForGeneralXLSXDownload"
        >
          Download
        </button>
      </div>
    </div>
  </div>
</template>
