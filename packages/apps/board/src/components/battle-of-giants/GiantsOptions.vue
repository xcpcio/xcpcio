<script setup lang="ts">
import type { Giants, Rank, SelectOptionItem } from "@xcpcio/core";
import { GiantsType } from "@xcpcio/core";
import { MultiSelect } from "vue-search-select";

const props = defineProps<{
  rank: Rank;
  orgOptions: SelectOptionItem[];
  teamsOptions: SelectOptionItem[];
  giants: Giants;
}>();

const emit = defineEmits([
  "update:giants",
]);

const giants = computed({
  get() {
    return props.giants;
  },
  set(value) {
    emit("update:giants", value);
  },
});

const orgSelectedItems = ref<Array<SelectOptionItem>>(giants.value.filterOrganizations);
function orgOnSelect(selectedItems: Array<SelectOptionItem>, _lastSelectItem: SelectOptionItem) {
  orgSelectedItems.value = selectedItems;
  giants.value.setFilterOrganizations(selectedItems);
}

const teamsSelectedItems = ref<Array<SelectOptionItem>>(giants.value.filterTeams);
function teamsOnSelect(selectedItems: Array<SelectOptionItem>, _lastSelectItem: SelectOptionItem) {
  teamsSelectedItems.value = selectedItems;
  giants.value.setFilterTeams(selectedItems);
}

const title = computed(() => {
  return `${giants.value.type === GiantsType.BLUE ? "Blue" : "Red"} Team`;
});

const color = computed(() => {
  return giants.value.type === GiantsType.BLUE ? "#0000FF" : "#FF0000";
});
</script>

<template>
  <div
    ml-4 mt-2
  >
    <div
      flex text-sm
      :style="{
        color,
      }"
    >
      {{ title }}
    </div>

    <div
      ml-4 mt-2
      grid grid-cols-6 gap-y-4
    >
      <div
        flex items-center
        text-sm
      >
        Name:
      </div>

      <div
        flex items-center
        w-full
        col-span-5
      >
        <TheInput
          v-model="giants.name"
          text-align="left"
        />

        <Tooltip>
          <div
            i-material-symbols-refresh
            cursor-pointer btn
            text-2xl
            ml-2
            @click="giants.refreshName()"
          />

          <template #popper>
            <div>
              Refresh Name
            </div>
          </template>
        </Tooltip>
      </div>

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
        col-span-5
      >
        <MultiSelect
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
        col-span-5
      >
        <MultiSelect
          :options="teamsOptions"
          :selected-options="teamsSelectedItems"
          @select="teamsOnSelect"
        />
      </div>
    </div>
  </div>
</template>
