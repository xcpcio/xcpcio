<script setup lang="ts">
import type { Pagination } from "~/composables/pagination";

const props = defineProps<{
  pagination: Pagination,
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
</script>

<template>
  <nav class="flex flex-col space-y-3 md:flex-row md:items-center md:space-y-0 items-start justify-between p-4" aria-label="Table navigation">
    <span class="text-sm text-gray-500 dark:text-gray-400 font-normal">
      Showing
      <span class="text-gray-900 dark:text-white font-semibold">{{ p.currentLeft }}-{{ p.currentRight - 1 }}</span>
      of
      <span class="font-semibold text-gray-900 dark:text-white">{{ p.totalSize }}</span>
    </span>

    <ul class="font-mono inline-flex items-stretch -space-x-px">
      <li>
        <a
          href="#"
          class="flex items-center justify-center px-3 text-gray-500 bg-white border hover:bg-gray-100 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white h-full py-1.5 ml-0 rounded-l-lg border-gray-300 hover:text-gray-700 dark:border-gray-700"
          @click="p.onPageChange({ diff: -1 })"
        >
          <span class="sr-only">Previous</span>
          <svg class="w-5 h-5" aria-hidden="true" fill="currentColor" viewbox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" />
          </svg>
        </a>
      </li>

      <li v-if="p.currentPage !== 0">
        <a
          href="#"
          :class="class_pagination_ix"
          @click=" p.onPageChange({ to: 0 })"
        >
          1
        </a>
      </li>

      <li v-for="pn in p.leftDecrPage" :key="pn">
        <a
          href="#"
          :class="class_pagination_ix"
          @click="p.onPageChange({ to: pn })"
        >
          {{ pn + 1 }}
        </a>
      </li>

      <li>
        <a
          href="#"
          aria-current="page"
          class="flex items-center justify-center px-3 py-2 text-sm border hover:text-primary-700 dark:border-gray-700 dark:bg-gray-700 dark:text-white z-10 leading-tight text-primary-600 bg-primary-50 border-primary-300 hover:bg-primary-100"
        >
          {{ p.currentPage + 1 }}
        </a>
      </li>

      <li v-for="pn in p.rightIncrPage" :key="pn">
        <a
          href="#"
          :class="class_pagination_ix"
          @click="p.onPageChange({ to: pn })"
        >
          {{ pn + 1 }}
        </a>
      </li>

      <li v-if="p.currentPage !== p.totalPage - 1">
        <a
          href="#"
          :class="class_pagination_ix"
          @click="p.onPageChange({ to: p.totalPage - 1 })"
        >
          {{ p.totalPage }}
        </a>
      </li>

      <li>
        <a
          href="#"
          class="flex items-center justify-center h-full py-1.5 px-3 leading-tight text-gray-500 bg-white border border-gray-300 hover:bg-gray-100 hover:text-gray-700 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white rounded-r-lg"
          @click="p.onPageChange({ diff: 1 })"
        >
          <span class="sr-only">Next</span>
          <svg class="w-5 h-5" aria-hidden="true" fill="currentColor" viewbox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
            <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
          </svg>
        </a>
      </li>
    </ul>
  </nav>
</template>
