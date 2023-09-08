<script setup lang="ts">
const props = defineProps<{
  type: string,
}>();

const emit = defineEmits(["update:type"]);

const { t } = useI18n();

const currentType = computed({
  get() {
    return props.type;
  },
  set(value) {
    emit("update:type", value);
  },
});

function onChangeType(type: string) {
  currentType.value = type;
}
</script>

<template>
  <div
    role="group"
    inline-flex flex-col w-full
    md:w-auto md:flex-row
    rounded-md shadow-sm
  >
    <button
      type="button"
      px-4 py-2 my-2 text-sm font-medium
      text-gray-900 bg-white
      dark:bg-gray-700 dark:border-gray-600 dark:text-white
      border border-gray-200
      rounded-t-lg md:rounded-tr-none md:rounded-l-lg
      hover:bg-gray-100 dark:hover:bg-gray-600
      hover:text-primary-700 dark:hover:text-white
      focus:z-10 focus:ring-2
      focus:ring-primary-700 focus:text-primary-700
      dark:focus:ring-primary-500 dark:focus:text-white
      :class="{
        'z-10 ring-2 ring-primary-700 text-primary-700 dark:ring-primary-600 dark:text-white': currentType === 'submissions',
      }"
      @click="onChangeType('submissions')"
    >
      {{ t("type_menu.submissions") }}
    </button>
    <button
      type="button"
      px-4 py-2 my-2 text-sm font-medium
      text-gray-900 bg-white
      border-t border-x md:border-x-0 md:border-b
      border-gray-200
      hover:bg-gray-100 hover:text-primary-700
      focus:z-10 focus:ring-2 focus:ring-primary-700 focus:text-primary-700
      dark:bg-gray-700 dark:border-gray-600 dark:text-white
      dark:hover:text-white dark:hover:bg-gray-600
      dark:focus:ring-primary-500 dark:focus:text-white
      :class="{
        'z-10 ring-2 ring-primary-700 text-primary-700 dark:ring-primary-600 dark:text-white': currentType === 'statistics',
      }"
      @click="onChangeType('statistics')"
    >
      {{ t("type_menu.statistics") }}
    </button>
    <button
      type="button"
      px-4 py-2 my-2 mr-2 text-sm font-medium
      text-gray-900 bg-white
      border border-gray-200
      rounded-b-lg md:rounded-bl-none md:rounded-r-lg
      hover:bg-gray-100 hover:text-primary-700
      focus:z-10 focus:ring-2 focus:ring-primary-700 focus:text-primary-700
      dark:bg-gray-700 dark:border-gray-600 dark:text-white
      dark:hover:text-white dark:hover:bg-gray-600
      dark:focus:ring-primary-500 dark:focus:text-white
      :class="{
        'z-10 ring-2 ring-primary-700 text-primary-700 dark:ring-primary-600 dark:text-white': currentType === 'balloon',
      }"
      @click="onChangeType('balloon')"
    >
      {{ t("type_menu.balloon") }}
    </button>
  </div>
</template>
