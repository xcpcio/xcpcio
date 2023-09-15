<script setup lang="ts">
import { useRouteQuery } from "@vueuse/router";
import type { Lang } from "@xcpcio/types";

export interface Item {
  title?: string;

  titles?: Map<Lang, string>;
  defaultLang?: Lang;

  keyword: string;
  isDefault?: boolean;
  link?: string;
}

const props = defineProps<{
  items: Array<Item>;
  currentItem: string;
  queryParamName: string;
  reverseOrder?: boolean;
  // eslint-disable-next-line unused-imports/no-unused-vars
  onChange?: (current: string) => void;
}>();

const emit = defineEmits(["update:currentItem"]);

const defaultType = computed(() => {
  for (const item of props.items) {
    if (item.isDefault) {
      return item.keyword;
    }
  }

  return props.items?.[0].keyword;
});

const currentItemFromRouteQuery = useRouteQuery(
  props.queryParamName,
  defaultType.value,
  { transform: String },
);

const currentItem = computed({
  get() {
    return props.currentItem;
  },
  set(value) {
    emit("update:currentItem", value);
  },
});

const { t, locale } = useI18n();

function getTitle(item: Item) {
  if (item.title) {
    return t(item.title);
  }

  if (item.titles) {
    return item.titles.get(locale.value as unknown as Lang) ?? item.titles.get(item.defaultLang!);
  }

  return "";
}

function isCurrent(item: Item): boolean {
  if (currentItem.value === item.keyword) {
    return true;
  }

  return false;
}

function onClick(item: Item) {
  if (item.link) {
    return;
  }

  currentItem.value = item.keyword;
  currentItemFromRouteQuery.value = item.keyword;

  if (props.onChange) {
    props.onChange(item.keyword);
  }
}

onMounted(() => {
  (() => {
    if (!(currentItemFromRouteQuery.value?.length > 0)) {
      return;
    }

    currentItem.value = currentItemFromRouteQuery.value;
    if (props.onChange) {
      props.onChange(currentItemFromRouteQuery.value);
    }
  })();
});
</script>

<template>
  <div
    class="second-level-menu-list"
    font-mono
  >
    <div
      class="mr-[-4px]"
      flex
      :class="{
        'flex-row-reverse': props.reverseOrder,
      }"
    >
      <template
        v-for="item in props.items"
        :key="item.keyword"
      >
        <div
          class="second-level-menu-item"
          :class="[isCurrent(item) ? 'second-level-menu-item-current' : '']"
          @click="onClick(item)"
        >
          <div>
            <a
              v-if="item.link"
              :href="item.link"
              target="_blank"
              title="Resolver"
            >
              {{ getTitle(item) }}
            </a>

            <div
              v-if="!item.link"
            >
              {{ getTitle(item) }}
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>
.second-level-menu-list {
  display: flex;
}

.second-level-menu-item {
  height: 18px;
  background: #333;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #fff;
  font-size: 14px;
  font-weight: 700;
  -webkit-transition: 0.7s;
  transition: 0.7s;
  cursor: pointer;
  margin: 2px 4px !important;
  padding: 4px !important;
  box-sizing: content-box !important;
  border-radius: 3px;
}

.second-level-menu-item:hover {
  background: #f30;
}

.second-level-menu-item-current {
  background: #f30;
}
</style>
