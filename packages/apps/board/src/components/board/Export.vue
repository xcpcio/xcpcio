<script setup lang="ts">
import type { Rank } from "@xcpcio/core";
import type { Lang } from "@xcpcio/types";
import { buildRankForGroup, createStandingsImage } from "@board/composables/standings-image";
import { CodeforcesGymGhostDATConverter, GeneralExcelConverter, ICPCStandingsCsvConverter } from "@xcpcio/core";

import FileSaver from "file-saver";
import sleep from "sleep-promise";

import { ModelSelect } from "vue-search-select";
import { useToast } from "vue-toast-notification";

const props = defineProps<{
  rank: Rank;
}>();

const $toast = useToast();
const { t, locale } = useI18n();
const lang = computed(() => locale.value as unknown as Lang);

const { copy, isSupported } = useClipboard();

const rank = computed(() => props.rank);

const currentItem = ref({ value: "general-xlsx", text: "Excel Table(xlsx)" });
const options = ref([
  {
    value: "general-xlsx",
    text: "Excel Table(xlsx)",
  },
  {
    value: "cf-dat",
    text: "Codeforces Gym Ghost(dat)",
  },
  {
    value: "icpc-standings-csv",
    text: "ICPC Standings(csv)",
  },
  {
    value: "standings-image",
    text: "Standings Image(png)",
  },
]);

const selectedGroup = ref(rank.value.options.group || "all");
const teamCount = ref(20);

const groupOptions = computed(() => {
  return Array.from(rank.value.contest.group, ([value, group]) => ({
    value,
    text: group.name.getOrDefault(lang.value),
  }));
});

const maxTeamCount = computed(() => rank.value.originTeams.length);

const btnDisable = ref({
  CfDatDownload: false,
  CfDatCopy: false,
  GeneralXLSXDownload: false,
  ICPCStandingsCsvDownload: false,
  StandingsImageDownload: false,
});

const includeFakeRussianTeams = ref(false);

async function waitDisabled() {
  await nextTick();
  await sleep(16);
}

async function onClickForCfDatDownload() {
  btnDisable.value.CfDatDownload = true;
  await waitDisabled();

  const converter = new CodeforcesGymGhostDATConverter();
  const dat = converter.convert(rank.value, { includeFakeRussianTeams: includeFakeRussianTeams.value });
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
  const dat = converter.convert(rank.value, { includeFakeRussianTeams: includeFakeRussianTeams.value });
  copy(dat);

  btnDisable.value.CfDatCopy = false;
  $toast.success("Copy Success");
}

async function onClickForGeneralXLSXDownload() {
  btnDisable.value.GeneralXLSXDownload = true;
  await waitDisabled();

  const converter = new GeneralExcelConverter(lang.value);
  converter.convertAndWrite(rank.value, `${rank.value.contest.name.getOrDefault()}.xlsx`);

  btnDisable.value.GeneralXLSXDownload = false;
}

async function onClickForICPCStandingsCsvDownload() {
  btnDisable.value.ICPCStandingsCsvDownload = true;
  await waitDisabled();

  const converter = new ICPCStandingsCsvConverter();
  const csv = converter.convert(rank.value);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  FileSaver.saveAs(blob, "standings.csv");

  btnDisable.value.ICPCStandingsCsvDownload = false;
}

async function onClickForStandingsImageDownload() {
  btnDisable.value.StandingsImageDownload = true;
  await waitDisabled();

  try {
    const requestedCount = Math.min(Math.max(Math.floor(teamCount.value) || 1, 1), maxTeamCount.value);
    const imageRank = buildRankForGroup(rank.value, selectedGroup.value);
    const count = Math.min(requestedCount, imageRank.teams.length);
    const blob = await createStandingsImage(imageRank, {
      teamCount: count,
      lang: lang.value,
      theme: isDark.value ? "dark" : "light",
      link: `${window.location.origin}${window.location.pathname}`,
      labels: {
        place: t("utility.image_place"),
        team: t("utility.image_team"),
        solved: t("utility.image_solved"),
        penalty: t("utility.image_penalty"),
        group: t("utility.group"),
        teams: t("utility.teams"),
      },
    });

    FileSaver.saveAs(blob, `standings-${selectedGroup.value}-top${count}.png`);
    $toast.success("Download Success");
  } catch (error) {
    console.error(error);
    $toast.error("Download Failed");
  } finally {
    btnDisable.value.StandingsImageDownload = false;
  }
}
</script>

<template>
  <div
    flex flex-col
  >
    <div
      class="w-full max-w-[40rem] font-bold"
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
        v-if="currentItem.value === 'standings-image'"
        flex flex-col gap-4
      >
        <div class="grid gap-4 sm:grid-cols-2">
          <label class="block">
            <span class="mb-1 block text-sm font-semibold text-gray-900 dark:text-gray-300">
              {{ t("utility.group") }}
            </span>
            <select
              v-model="selectedGroup"
              class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-normal text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            >
              <option
                v-for="group in groupOptions"
                :key="group.value"
                :value="group.value"
              >
                {{ group.text }}
              </option>
            </select>
          </label>

          <label class="block">
            <span class="mb-1 block text-sm font-semibold text-gray-900 dark:text-gray-300">
              {{ t("utility.teams") }}
            </span>
            <input
              v-model.number="teamCount"
              type="number"
              min="1"
              :max="maxTeamCount"
              inputmode="numeric"
              class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-normal text-gray-900 focus:border-primary-500 focus:outline-none focus:ring-primary-500 dark:border-gray-600 dark:bg-gray-700 dark:text-white"
            >
          </label>
        </div>

        <div flex justify-center>
          <button
            :disabled="btnDisable.StandingsImageDownload"
            btn
            @click="onClickForStandingsImageDownload"
          >
            Download
          </button>
        </div>
      </div>

      <div
        v-if="currentItem.value === 'cf-dat'"
        flex flex-col gap-4
      >
        <div flex justify-center>
          <TheCheckbox v-model="includeFakeRussianTeams">
            <span ml-3 text-sm font-medium text-gray-900 dark:text-gray-300>
              Include fake Russian teams (100 placeholder teams)
            </span>
          </TheCheckbox>
        </div>

        <div flex flex-row justify-center gap-4>
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

      <div
        v-if="currentItem.value === 'icpc-standings-csv'"
        flex justify-center
      >
        <button
          :disabled="btnDisable.ICPCStandingsCsvDownload"
          btn
          @click="onClickForICPCStandingsCsvDownload"
        >
          Download
        </button>
      </div>
    </div>
  </div>
</template>
