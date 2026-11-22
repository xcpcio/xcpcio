<script setup lang="ts">
import type { Rank } from "@xcpcio/core";
import type { Lang } from "@xcpcio/types";
import { buildRankForGroup, createStandingsImage } from "@board/composables/standings-image";

import FileSaver from "file-saver";
import sleep from "sleep-promise";
import { ModelSelect } from "vue-search-select";
import { useToast } from "vue-toast-notification";

const props = defineProps<{
  isHidden: boolean;
  rank: Rank;
}>();

const emit = defineEmits(["update:isHidden"]);

const { t, locale } = useI18n();
const lang = computed(() => locale.value as unknown as Lang);
const $toast = useToast();

const isHidden = computed({
  get() {
    return props.isHidden;
  },
  set(value) {
    emit("update:isHidden", value);
  },
});

const rank = computed(() => props.rank);
const selectedGroup = ref(rank.value.options.group || "all");
const teamCount = ref(20);
const isWorking = ref(false);

const groupOptions = computed(() => {
  return Array.from(rank.value.contest.group, ([value, group]) => ({
    value,
    text: group.name.getOrDefault(lang.value),
  }));
});

const selectedGroupItem = computed({
  get: () => groupOptions.value.find(option => option.value === selectedGroup.value) ?? groupOptions.value[0] ?? { value: "all", text: "All" },
  set: (option: { value: string; text: string } | undefined) => {
    selectedGroup.value = option?.value ?? "all";
  },
});

const maxTeamCount = computed(() => rank.value.originTeams.length);

const canDecreaseTeamCount = computed(() => (Number(teamCount.value) || 1) > 1);
const canIncreaseTeamCount = computed(() => (Number(teamCount.value) || 0) < maxTeamCount.value);

function clampTeamCount(value: number) {
  return Math.min(maxTeamCount.value, Math.max(1, Number.isFinite(value) ? Math.floor(value) : 1));
}

function normalizeTeamCount() {
  teamCount.value = clampTeamCount(Number(teamCount.value));
}

function stepTeamCount(delta: number) {
  teamCount.value = clampTeamCount((Number(teamCount.value) || 1) + delta);
}

async function generateImage() {
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

  return { blob, count };
}

async function runWithWorkingState(action: () => Promise<void>) {
  isWorking.value = true;
  await nextTick();
  await sleep(16);

  try {
    await action();
  } finally {
    isWorking.value = false;
  }
}

async function download() {
  await runWithWorkingState(async () => {
    try {
      const { blob, count } = await generateImage();
      FileSaver.saveAs(blob, `standings-${selectedGroup.value}-top${count}.png`);
      $toast.success(t("utility.download_success"));
    } catch (error) {
      console.error(error);
      $toast.error(t("utility.download_failed"));
    }
  });
}

async function copyImage() {
  if (!navigator.clipboard?.write || typeof ClipboardItem === "undefined") {
    $toast.warning(t("common.clipboard_not_supported"));
    return;
  }

  await runWithWorkingState(async () => {
    try {
      const { blob } = await generateImage();
      await navigator.clipboard.write([
        new ClipboardItem({
          "image/png": blob,
        }),
      ]);
      $toast.success(t("common.copy_success"));
    } catch (error) {
      console.error(error);
      $toast.error(t("common.copy_failed"));
    }
  });
}
</script>

<template>
  <Modal
    v-model:is-hidden="isHidden"
    :title="t('utility.export_image')"
    width="w-96"
    mt="mt-16"
  >
    <div class="flex w-full flex-col gap-4">
      <div class="block">
        <span class="mb-1 block text-sm font-semibold text-gray-900 dark:text-gray-300">
          {{ t("utility.group") }}
        </span>
        <ModelSelect
          v-model="selectedGroupItem"
          :options="groupOptions"
          :placeholder="t('utility.group')"
          class="w-full font-normal"
        />
      </div>

      <div class="block">
        <span class="mb-1 block text-sm font-semibold text-gray-900 dark:text-gray-300">
          {{ t("utility.teams") }}
        </span>
        <div class="flex h-10 w-full items-center overflow-hidden rounded-lg border border-gray-300 bg-white transition focus-within:border-primary-500 focus-within:ring-1 focus-within:ring-primary-500 dark:border-gray-600 dark:bg-gray-700">
          <button
            type="button"
            class="flex h-full w-10 shrink-0 items-center justify-center border-r border-gray-200 text-gray-500 transition hover:bg-gray-100 hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-30 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600 dark:hover:text-white"
            :disabled="!canDecreaseTeamCount || isWorking"
            :aria-label="t('utility.decrease_teams')"
            @click="stepTeamCount(-1)"
          >
            <div i-material-symbols-remove text-lg />
          </button>

          <input
            v-model.number="teamCount"
            type="number"
            min="1"
            :max="maxTeamCount"
            inputmode="numeric"
            class="team-count-input min-w-0 flex-1 border-0 bg-transparent px-2 text-center text-sm font-normal text-gray-900 outline-none dark:text-white"
            @blur="normalizeTeamCount"
            @keydown.enter="normalizeTeamCount"
          >

          <button
            type="button"
            class="flex h-full w-10 shrink-0 items-center justify-center border-l border-gray-200 text-gray-500 transition hover:bg-gray-100 hover:text-gray-900 disabled:cursor-not-allowed disabled:opacity-30 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-600 dark:hover:text-white"
            :disabled="!canIncreaseTeamCount || isWorking"
            :aria-label="t('utility.increase_teams')"
            @click="stepTeamCount(1)"
          >
            <div i-material-symbols-add text-lg />
          </button>
        </div>
      </div>

      <div class="flex gap-3">
        <button
          type="button"
          :disabled="isWorking"
          btn
          class="flex-1"
          @click="copyImage"
        >
          {{ t("utility.copy_image") }}
        </button>

        <button
          type="button"
          :disabled="isWorking"
          btn
          class="flex-1"
          @click="download"
        >
          {{ t("utility.download") }}
        </button>
      </div>
    </div>
  </Modal>
</template>

<style scoped>
.team-count-input {
  appearance: textfield;
  -moz-appearance: textfield;
}

.team-count-input::-webkit-inner-spin-button,
.team-count-input::-webkit-outer-spin-button {
  margin: 0;
  -webkit-appearance: none;
}
</style>
