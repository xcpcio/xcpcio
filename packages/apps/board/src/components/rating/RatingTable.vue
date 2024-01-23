<script setup lang="ts">
import { MultiSelect } from "vue-search-select";

import type { Rating, SelectOptionItem } from "@xcpcio/core";

import { Pagination } from "~/composables/pagination";

interface FilterOptions {
  organizations: string[];
  members: string[];
}

const props = defineProps<{
  rating: Rating,
  pageSize?: number;
  removeBorder?: boolean;
}>();

const rating = computed(() => props.rating);

const filterOptions = ref<FilterOptions>({
  organizations: [],
  members: [],
});

const orgOptions = computed(() => {
  let res = rating.value.users.map((u) => {
    return u.organization;
  });
  res = Array.from(new Set(res));

  return res.map((o) => {
    return {
      value: o,
      text: o,
    };
  });
});

const orgSelectedItems = ref<Array<SelectOptionItem>>([]);
const orgLastSelectItem = ref({});
function orgOnSelect(selectedItems: Array<SelectOptionItem>, lastSelectItem: SelectOptionItem) {
  orgSelectedItems.value = selectedItems;
  orgLastSelectItem.value = lastSelectItem;
}

// const memberOptions = computed(() => {
//   const se = new Set();
//   rating.value.users.forEach((u) => {
//     return u.members.forEach((m) => {
//       se.add(m.name);
//     });
//   });
//   const res = Array.from(se);

//   return res.map((o) => {
//     return {
//       value: o,
//       text: o,
//     };
//   });
// });

// const memberSelectedItems = ref<Array<SelectOptionItem>>([]);
// const memberLastSelectItem = ref({});

// function memberOnSelect(selectedItems: Array<SelectOptionItem>, lastSelectItem: SelectOptionItem) {
//   memberSelectedItems.value = selectedItems;
//   memberLastSelectItem.value = lastSelectItem;
// }

const users = computed(() => {
  const us = rating.value.users;
  return us.filter((u) => {
    const o = filterOptions.value;

    if (o.organizations.length === 0
    && o.members.length === 0) {
      return true;
    }

    for (const org of o.organizations) {
      if (org === u.organization) {
        return true;
      }
    }

    for (const member of o.members) {
      for (const m of u.members) {
        if (member === m.name) {
          return true;
        }
      }
    }

    return false;
  });
});

function onFilter() {
  const newFilterOptions: FilterOptions = {
    organizations: [],
    members: [],
  };

  newFilterOptions.organizations = orgSelectedItems.value.map(o => o.value);
  // newFilterOptions.members = memberSelectedItems.value.map(o => o.value);

  filterOptions.value = newFilterOptions;
}

const p = ref(new Pagination());

p.value.currentPage = 0;
p.value.pageSize = props.pageSize ?? 20;
p.value.totalSize = users.value.length;

watch(users, () => {
  p.value.totalSize = users.value.length;

  if (p.value.currentPage >= p.value.totalPage) {
    p.value.currentPage = p.value.totalPage - 1;
  }
});

const currentUsers = computed(() => {
  return users.value.slice(p.value.currentLeft, p.value.currentRight);
});
</script>

<template>
  <section>
    <div
      mx-auto w-full
    >
      <div
        relative overflow-hidden
        bg-white dark:bg-gray-800
        :class="{
          'shadow-md': props.removeBorder !== true,
          'sm:rounded-sm': props.removeBorder !== true,
        }"
      >
        <div
          space-y-3
          flex flex-col
          px-4 py-3
          lg:flex-row lg:items-center lg:justify-between
          lg:space-x-4 lg:space-y-0
        >
          <div
            flex flex-shrink-0 flex-col
            md:flex-row md:items-center
            lg:justify-end space-y-3
            md:space-x-3 md:space-y-0
          >
            <div
              w-108
            >
              <MultiSelect
                :options="orgOptions"
                :selected-options="orgSelectedItems"
                placeholder="Organization"
                @select="orgOnSelect"
              />
            </div>

            <!-- <div
              w-68
            >
              <MultiSelect
                :options="memberOptions"
                :selected-options="memberSelectedItems"
                placeholder="Member"
                @select="memberOnSelect"
              />
            </div> -->

            <div>
              <button
                type="button"
                class="flex flex-shrink-0 items-center justify-center border border-gray-200 rounded-lg bg-white px-3 py-2 text-sm font-medium text-gray-900 focus:z-10 dark:border-gray-600 dark:bg-gray-800 hover:bg-gray-100 dark:text-gray-400 hover:text-primary-700 focus:outline-none focus:ring-4 focus:ring-gray-200 dark:hover:bg-gray-700 dark:hover:text-white dark:focus:ring-gray-700"
                @click="onFilter"
              >
                <div
                  i-material-symbols-search
                  mr-1 h-5 w-5
                />
                Filter
              </button>
            </div>
          </div>
        </div>

        <div
          class="overflow-x-auto"
        >
          <table
            class="w-full text-left text-sm text-gray-500 dark:text-gray-400"
            font-medium font-mono
          >
            <thead
              text-xs
              bg-gray-50 text-gray-700
              dark:bg-gray-700 dark:text-gray-400
            >
              <tr>
                <th
                  scope="col"
                  class="px-4 py-3"
                  w-68
                >
                  Organization
                </th>
                <th
                  scope="col"
                  class="px-4 py-3"
                  w-128
                >
                  TeamName
                </th>
                <th
                  scope="col"
                  class="px-4 py-3"
                  w-68
                >
                  Members
                </th>
                <th
                  scope="col"
                  class="px-4 py-3"
                >
                  Rating
                </th>
                <th
                  scope="col"
                  class="px-4 py-3"
                >
                  MaxRating
                </th>
                <th
                  scope="col"
                  class="px-4 py-3"
                >
                  MinRating
                </th>
              </tr>
            </thead>

            <tbody>
              <template
                v-for="u in currentUsers"
                :key="u.id"
              >
                <tr
                  class="border-b dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <td
                    class="whitespace-nowrap px-4 py-2 text-gray-900 dark:text-white"
                  >
                    {{ u.organization }}
                  </td>
                  <td class="whitespace-nowrap px-4 py-2 text-gray-900 dark:text-white">
                    {{ u.name }}
                  </td>
                  <td class="whitespace-nowrap px-4 py-2 text-gray-900 dark:text-white">
                    {{ u.members.map(m => m.name.trim()).join(",") }}
                  </td>
                  <td class="whitespace-nowrap px-4 py-2 text-gray-900 dark:text-white">
                    {{ u.rating }}
                  </td>
                  <td class="whitespace-nowrap px-4 py-2 text-gray-900 dark:text-white">
                    {{ u.maxRating }}
                  </td>
                  <td class="whitespace-nowrap px-4 py-2 text-gray-900 dark:text-white">
                    {{ u.minRating }}
                  </td>
                </tr>
              </template>
            </tbody>
          </table>
        </div>

        <TablePagination
          v-model:pagination="p"
        />
      </div>
    </div>
  </section>
</template>
