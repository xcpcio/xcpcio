<script setup lang="ts">
import type { I18nText } from "@xcpcio/core";
import type { Lang } from "@xcpcio/types";

export interface Item {
  title: string | I18nText;
  keyword: string;

  icon?: string;
  link?: string;
  isModal?: boolean;
  isDefault?: boolean;
}

const props = defineProps<{
  items: Array<Item>;
  currentItem: string;
  queryParamName: string;
  reverseOrder?: boolean;
  vertical?: boolean;

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

const currentItemFromRouteQuery = useRouteQueryWithoutParam(
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
const lang = computed(() => locale.value as unknown as Lang);
const isMobileLayout = useMediaQuery("(max-width: 1023.98px)");

function getTitle(item: Item) {
  if (typeof item.title === "string") {
    return t(item.title);
  }

  return item.title?.getOrDefault(lang.value);
}

function isCurrent(item: Item): boolean {
  if (currentItem.value === item.keyword) {
    return true;
  }

  return false;
}

function onClick(item: Item) {
  if (props.onChange) {
    props.onChange(item.keyword);
  }

  if (item.link || item.isModal) {
    return;
  }

  currentItem.value = item.keyword;
  currentItemFromRouteQuery.value = item.keyword;
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
    font-mono
    flex
    max-lg:w-full
    :class="props.vertical ? 'flex-col' : ''"
  >
    <div
      :class="[
        props.vertical
          ? 'flex w-full flex-col gap-1'
          : 'mr-[-4px] flex max-lg:w-full max-lg:flex-wrap',
        {
          'flex-row-reverse': !props.vertical && props.reverseOrder && !isMobileLayout,
          'max-lg:justify-end': !props.vertical && props.reverseOrder,
        },
      ]"
    >
      <template
        v-for="item in props.items"
        :key="item.keyword"
      >
        <div
          class="second-level-menu-item"
          :class="[
            isCurrent(item) ? 'second-level-menu-item-current' : '',
            props.vertical ? 'second-level-menu-item-vertical' : '',
          ]"
          @click="onClick(item)"
        >
          <div
            v-if="props.vertical && item.icon"
            :class="item.icon"
            class="second-level-menu-icon shrink-0"
          />

          <div class="min-w-0">
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

@media (max-width: 1023.98px) {
  .second-level-menu-item {
    height: auto;
    min-height: 24px;
    padding: 8px 10px !important;
  }
}

.second-level-menu-item-vertical {
  box-sizing: border-box !important;
  width: 100%;
  height: auto !important;
  min-height: 44px;
  justify-content: flex-start;
  gap: 0.625rem;
  margin: 0 !important;
  padding: 0.5rem 0.75rem !important;
  border: 1px solid transparent;
  border-radius: 0.5rem;
  background: transparent;
  color: #374151;
  font-size: 14px;
  font-weight: 600;
  transition:
    background-color 150ms ease,
    color 150ms ease,
    border-color 150ms ease;
}

.second-level-menu-item-vertical:hover {
  background: #f3f4f6;
  color: #0f766e;
}

.second-level-menu-item-vertical.second-level-menu-item-current {
  border-color: #99f6e4;
  background: #ccfbf1;
  color: #0f766e;
}

.second-level-menu-icon {
  font-size: 1.25rem;
  opacity: 0.75;
}

.dark .second-level-menu-item-vertical {
  color: #e5e7eb;
}

.dark .second-level-menu-item-vertical:hover {
  background: #374151;
  color: #5eead4;
}

.dark .second-level-menu-item-vertical.second-level-menu-item-current {
  border-color: #0f766e;
  background: #134e4a;
  color: #5eead4;
}
</style>
