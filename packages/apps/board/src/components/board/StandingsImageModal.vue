<script setup lang="ts">
import type { Rank } from "@xcpcio/core";
import type { Lang } from "@xcpcio/types";
import { buildRankForGroup, createStandingsImage } from "@board/composables/standings-image";

import FileSaver from "file-saver";
import sleep from "sleep-promise";
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
const isDownloading = ref(false);

const groupOptions = computed(() => {
  return Array.from(rank.value.contest.group, ([value, group]) => ({
    value,
    text: group.name.getOrDefault(lang.value),
  }));
});

const maxTeamCount = computed(() => rank.value.originTeams.length);

async function download() {
  isDownloading.value = true;
  await nextTick();
  await sleep(16);

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
    isDownloading.value = false;
  }
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

      <button
        type="button"
        :disabled="isDownloading"
        btn
        class="w-full"
        @click="download"
      >
        Download
      </button>
    </div>
  </Modal>
</template>
