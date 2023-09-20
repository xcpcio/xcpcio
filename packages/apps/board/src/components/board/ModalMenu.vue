<script setup lang="ts">
const props = defineProps<{
  currentType: string,
  types: Array<string>,
}>();

const emit = defineEmits(["update:currentType"]);

const { t } = useI18n();

const currentType = computed({
  get() {
    return props.currentType;
  },
  set(value) {
    emit("update:currentType", value);
  },
});

function onChangeType(type: string) {
  currentType.value = type;
}

const typesLength = computed(() => props.types.length);
</script>

<template>
  <div
    role="group"
    inline-flex flex-col w-full
    md:w-auto md:flex-row
    rounded-md shadow-sm
  >
    <template
      v-for="(type, index) in props.types"
      :key="type"
    >
      <button
        type="button"
        px-4 py-2 my-2 text-sm font-medium
        text-gray-900 bg-white
        dark:bg-gray-700 dark:text-white
        border-gray-200 dark:border-gray-600
        hover:bg-gray-100 dark:hover:bg-gray-600
        hover:text-primary-700 dark:hover:text-white
        focus:z-10 focus:ring-2
        focus:ring-primary-700 focus:text-primary-700
        dark:focus:ring-primary-500 dark:focus:text-white
        :class="{
          'rounded-t-lg md:rounded-tr-none md:rounded-l-lg': index === 0,
          'rounded-b-lg md:rounded-bl-none md:rounded-r-lg mr-2': index + 1 === typesLength,
          'border': index === 0 || index + 1 === typesLength,
          'border-t border-x md:border-x-0 md:border-b': index > 0 && index + 1 < typesLength,
          'md:border-r-0': index === 0,
          'md:border-l': index > 0,
          'z-10 ring-2 ring-primary-700 text-primary-700 dark:ring-primary-600 dark:text-white': currentType === type,
        }"
        @click="onChangeType(type)"
      >
        {{ t(`type_menu.${type}`) }}
      </button>
    </template>
  </div>
</template>
