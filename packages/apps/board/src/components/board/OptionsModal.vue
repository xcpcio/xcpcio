<script setup lang="ts">
import { MultiSelect } from "vue-search-select";
import type { Rank, RankOptions, SelectOptionItem } from "@xcpcio/core";

const props = defineProps<{
  isHidden: boolean,

  rank: Rank,
  rankOptions: RankOptions,
}>();

const emit = defineEmits([
  "update:isHidden",
  "update:rankOptions",
]);

const { t } = useI18n();

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

const rank = computed(() => props.rank);

const title = computed(() => {
  return t("type_menu.options");
});

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
const orgLastSelectItem = ref({});

function orgOnSelect(selectedItems: Array<SelectOptionItem>, lastSelectItem: SelectOptionItem) {
  orgSelectedItems.value = selectedItems;
  orgLastSelectItem.value = lastSelectItem;
}

const teamsOptions = computed(() => {
  const res = rank.value.originTeams.map((t) => {
    return {
      value: t.id,
      text: t.organization ? `${t.name} - ${t.organization}` : t.name,
    };
  });

  return res;
});

const teamsSelectedItems = ref<Array<SelectOptionItem>>(rankOptions.value.filterTeams);
const teamsLastSelectItem = ref({});

function teamsOnSelect(selectedItems: Array<SelectOptionItem>, lastSelectItem: SelectOptionItem) {
  teamsSelectedItems.value = selectedItems;
  teamsLastSelectItem.value = lastSelectItem;
}

function onCancel() {
  isHidden.value = true;
}

const localStorageKeyForFilterOrganizations = getLocalStorageKeyForFilterOrganizations();
const localStorageKeyForFilterTeams = getLocalStorageKeyForFilterTeams();

function onConfirm() {
  rankOptions.value.setFilterOrganizations(orgSelectedItems.value);
  rankOptions.value.setFilterTeams(teamsSelectedItems.value);

  localStorage.setItem(localStorageKeyForFilterOrganizations, JSON.stringify(orgSelectedItems.value));
  localStorage.setItem(localStorageKeyForFilterTeams, JSON.stringify(teamsSelectedItems.value));

  onCancel();
}
</script>

<template>
  <Modal
    v-model:isHidden="isHidden"
    :title="title"
    width="w-180"
  >
    <div
      w-full
      font-bold font-mono
      flex flex-col gap-4
      items-center justify-center
    >
      <div
        v-if="rank.contest.organization"
        flex flex-col
        w-full
      >
        <div>
          Filter {{ rank.contest.organization }}
        </div>

        <div
          w-full
          mt-2
        >
          <MultiSelect
            :options="orgOptions"
            :selected-options="orgSelectedItems"
            @select="orgOnSelect"
          />
        </div>
      </div>

      <div
        flex flex-col
        w-full
      >
        <div>
          Filter Team
        </div>

        <div
          w-full
          mt-2
        >
          <MultiSelect
            :options="teamsOptions"
            :selected-options="teamsSelectedItems"
            @select="teamsOnSelect"
          />
        </div>
      </div>

      <div
        mt-2
        w-full
        flex items-center space-x-4
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
