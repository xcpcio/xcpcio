<script setup lang="ts">
import type { Rank, RankOptions, SelectOptionItem } from "@xcpcio/core";
import type { Lang } from "@xcpcio/types";
import _ from "lodash";

const props = defineProps<{
  isHidden: boolean;
  rank: Rank;
  rankOptions: RankOptions;
}>();

const emit = defineEmits([
  "update:isHidden",
  "update:rankOptions",
]);

const beforeRankOptions = _.cloneDeep(props.rankOptions);

const { t, locale } = useI18n();
const lang = computed(() => locale.value as unknown as Lang);

const isHidden = computed({
  get() {
    return props.isHidden;
  },
  set(value) {
    emit("update:isHidden", value);
  },
});

const rankOptions = computed({
  get() {
    return props.rankOptions;
  },
  set(value) {
    emit("update:rankOptions", value);
  },
});

const title = computed(() => {
  return t("type_menu.filter");
});

const rank = computed(() => props.rank);

const orgOptions = computed(() => {
  const res = rank.value.organizations.map((o) => {
    return {
      value: o,
      text: o,
    };
  });

  return res;
});

const orgSelectedItems = ref<Array<SelectOptionItem>>(rankOptions.value.filterOrganizations);
function orgOnSelect(selectedItems: Array<SelectOptionItem>, _lastSelectItem: SelectOptionItem) {
  orgSelectedItems.value = selectedItems;
  rankOptions.value.setFilterOrganizations(selectedItems);
}

const teamsOptions = computed(() => {
  const res = rank.value.originTeams.map((t) => {
    return {
      value: t.id,
      text: t.organization ? `${t.name.getOrDefault(lang.value)} - ${t.organization}` : t.name.getOrDefault(lang.value),
    };
  });

  return res;
});

const teamsSelectedItems = ref<Array<SelectOptionItem>>(rankOptions.value.filterTeams);
function teamsOnSelect(selectedItems: Array<SelectOptionItem>, _lastSelectItem: SelectOptionItem) {
  teamsSelectedItems.value = selectedItems;
  rankOptions.value.setFilterTeams(selectedItems);
}

async function onCancel() {
  rankOptions.value.setSelf(beforeRankOptions);
  await nextTick();
  isHidden.value = true;
}

async function onBeforeClose() {
  await onCancel();
}

const localStorageKeyForFilterOrganizations = getLocalStorageKeyForFilterOrganizations();
const localStorageKeyForFilterTeams = getLocalStorageKeyForFilterTeams();

function onConfirm() {
  // can't use useStorage, maybe it's a bug
  localStorage.setItem(localStorageKeyForFilterOrganizations, JSON.stringify(orgSelectedItems.value));
  localStorage.setItem(localStorageKeyForFilterTeams, JSON.stringify(teamsSelectedItems.value));

  isHidden.value = true;
}
</script>

<template>
  <Modal
    v-model:is-hidden="isHidden"
    :title="title"
    width="w-200"
    mt="mt-4"
    @on-before-close="onBeforeClose"
  >
    <div
      w-full
      font-bold font-mono text-base
      flex flex-col gap-4
      items-center justify-center
    >
      <div
        flex flex-col w-full
      >
        <div
          grid grid-cols-6 gap-y-4
        >
          <div
            v-if="rank.contest.organization"
            flex items-center
            text-sm
          >
            {{ rank.contest.organization }}:
          </div>

          <div
            v-if="rank.contest.organization"
            flex items-center
            w-full
            col-span-6
          >
            <TheMultiSelect
              :options="orgOptions"
              :selected-options="orgSelectedItems"
              @select="orgOnSelect"
            />
          </div>

          <div
            text-sm
            flex items-center
          >
            Team:
          </div>

          <div
            flex items-center
            w-full
            col-span-6
          >
            <TheMultiSelect
              :options="teamsOptions"
              :selected-options="teamsSelectedItems"
              @select="teamsOnSelect"
            />
          </div>
        </div>
      </div>

      <div
        w-full
        flex flex-row-reverse items-center
        gap-x-4
      >
        <button
          type="submit"
          class="text-white bg-primary-700 hover:bg-primary-800 focus:ring-4 focus:outline-none focus:ring-primary-300 px-5 py-2.5 text-center dark:bg-primary-600 dark:hover:bg-primary-700 dark:focus:ring-primary-800"
          font-medium text-sm
          rounded-md
          @click="onConfirm"
        >
          {{ t("button.confirm") }}
        </button>
        <button
          type="reset"
          class="py-2.5 px-5 text-gray-900 focus:outline-none bg-white border border-gray-200 hover:bg-gray-100 hover:text-primary-700 focus:z-10 focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700"
          font-medium text-sm
          rounded-md
          @click="onCancel"
        >
          {{ t("button.cancel") }}
        </button>
      </div>
    </div>
  </Modal>
</template>
