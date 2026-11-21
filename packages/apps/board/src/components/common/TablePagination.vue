<script setup lang="ts">
import type { Pagination } from "@board/composables/pagination";

const props = defineProps<{
  pagination: Pagination;
}>();
const emit = defineEmits(["update:pagination"]);

const p = computed({
  get() {
    return props.pagination;
  },
  set(value) {
    emit("update:pagination", value);
  },
});

const class_pagination_ix = "flex items-center justify-center px-3 py-2 text-sm text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white leading-tight";

const isMobileLayout = useMediaQuery("(max-width: 1023.98px)");
const isNarrowScreen = useMediaQuery("(max-width: 359.98px)");

const mobilePages = computed(() => {
  const total = p.value.totalPage;
  if (total <= 0) {
    return [];
  }

  const current = p.value.currentPage;
  const maxPages = isNarrowScreen.value ? 5 : 7;
  const pages = new Set([0, total - 1, current]);
  const powerPages: Array<number> = [];

  for (let page = 2; page <= total; page *= 2) {
    powerPages.push(page - 1);
  }

  powerPages.sort((lhs, rhs) => Math.abs(lhs - current) - Math.abs(rhs - current));

  for (const page of powerPages) {
    if (pages.size >= maxPages) {
      break;
    }

    pages.add(page);
  }

  return [...pages].sort((lhs, rhs) => lhs - rhs);
});
</script>

<template>
  <nav class="flex flex-col items-start justify-between p-4 md:flex-row md:items-center space-y-3 md:space-y-0" aria-label="Table navigation">
    <span class="text-sm font-normal text-gray-500 dark:text-gray-400">
      Showing
      <span class="font-semibold text-gray-900 dark:text-white">{{ p.currentLeft }}-{{ Math.max(0, p.currentRight - 1) }}</span>
      of
      <span class="font-semibold text-gray-900 dark:text-white">{{ p.totalSize }}</span>
    </span>

    <ul
      v-if="isMobileLayout"
      class="pagination-list inline-flex items-stretch font-mono -space-x-px"
    >
      <li>
        <a
          class="ml-0 flex h-full items-center justify-center rounded-l-lg border border-gray-300 bg-white px-2 py-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
          hover="cursor-pointer"
          @click="p.onPageChange({ diff: -1 })"
        >
          <span class="sr-only">Previous</span>
          <svg class="h-5 w-5" aria-hidden="true" fill="currentColor" viewbox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" />
          </svg>
        </a>
      </li>

      <li v-for="page in mobilePages" :key="page">
        <a
          v-if="page === p.currentPage"
          aria-current="page"
          class="z-10 flex items-center justify-center border border-primary-300 bg-primary-50 px-2 py-2 text-sm leading-tight text-primary-600 dark:border-gray-700 dark:bg-gray-700 dark:text-white"
        >
          {{ page + 1 }}
        </a>
        <a
          v-else
          :class="class_pagination_ix"
          hover="cursor-pointer"
          @click="p.onPageChange({ to: page })"
        >
          {{ page + 1 }}
        </a>
      </li>

      <li>
        <a
          class="flex h-full items-center justify-center rounded-r-lg border border-gray-300 bg-white px-2 py-1.5 text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
          hover="cursor-pointer"
          @click="p.onPageChange({ diff: 1 })"
        >
          <span class="sr-only">Next</span>
          <svg class="h-5 w-5" aria-hidden="true" fill="currentColor" viewbox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
          </svg>
        </a>
      </li>
    </ul>

    <ul
      v-else
      class="inline-flex items-stretch font-mono -space-x-px"
    >
      <li>
        <a
          class="ml-0 h-full flex items-center justify-center border border-gray-300 rounded-l-lg bg-white px-3 py-1.5 text-gray-500 dark:border-gray-700 dark:bg-gray-800 hover:bg-gray-100 dark:text-gray-400 hover:text-gray-700 dark:hover:bg-gray-700 dark:hover:text-white"
          hover="cursor-pointer"
          @click="p.onPageChange({ diff: -1 })"
        >
          <span class="sr-only">Previous</span>
          <svg class="h-5 w-5" aria-hidden="true" fill="currentColor" viewbox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" />
          </svg>
        </a>
      </li>

      <li v-if="p.currentPage !== 0">
        <a
          :class="class_pagination_ix"
          hover="cursor-pointer"
          @click=" p.onPageChange({ to: 0 })"
        >
          1
        </a>
      </li>

      <li v-for="pn in p.leftDecrPage" :key="pn">
        <a
          :class="class_pagination_ix"
          hover="cursor-pointer"
          @click="p.onPageChange({ to: pn })"
        >
          {{ pn + 1 }}
        </a>
      </li>

      <li>
        <a
          aria-current="page"
          class="z-10 flex items-center justify-center border border-primary-300 bg-primary-50 px-3 py-2 text-sm leading-tight text-primary-600 dark:border-gray-700 dark:bg-gray-700 hover:bg-primary-100 dark:text-white hover:text-primary-700"
          hover="cursor-pointer"
        >
          {{ p.currentPage + 1 }}
        </a>
      </li>

      <li v-for="pn in p.rightIncrPage" :key="pn">
        <a
          hover="cursor-pointer"
          :class="class_pagination_ix"
          @click="p.onPageChange({ to: pn })"
        >
          {{ pn + 1 }}
        </a>
      </li>

      <li v-if="p.currentPage !== p.totalPage - 1 && p.totalPage > 1">
        <a
          hover="cursor-pointer"
          :class="class_pagination_ix"
          @click="p.onPageChange({ to: p.totalPage - 1 })"
        >
          {{ p.totalPage }}
        </a>
      </li>

      <li>
        <a
          class="h-full flex items-center justify-center border border-gray-300 rounded-r-lg bg-white px-3 py-1.5 leading-tight text-gray-500 dark:border-gray-700 dark:bg-gray-800 hover:bg-gray-100 dark:text-gray-400 hover:text-gray-700 dark:hover:bg-gray-700 dark:hover:text-white"
          hover="cursor-pointer"
          @click="p.onPageChange({ diff: 1 })"
        >
          <span class="sr-only">Next</span>
          <svg class="h-5 w-5" aria-hidden="true" fill="currentColor" viewbox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
          </svg>
        </a>
      </li>
    </ul>
  </nav>
</template>

<style scoped>
@media (max-width: 1023.98px) {
  .pagination-list {
    width: 100%;
  }

  .pagination-list > li {
    min-width: 0;
    flex: 1 1 0;
  }

  .pagination-list > li > a {
    width: 100%;
    min-height: 2.5rem;
    padding: 0.5rem 0.25rem;
    font-size: 0.8125rem;
  }
}
</style>
