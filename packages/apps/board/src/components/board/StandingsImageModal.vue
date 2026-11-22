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
