<script setup lang="ts">
import { useRouteQuery } from "@vueuse/router";

export interface Item {
  title: string;
  keyword: string;
  isDefault?: boolean;
  link?: string;
}

const props = defineProps<{
  items: Array<Item>;
  // eslint-disable-next-line unused-imports/no-unused-vars
  onUpdateType: (type: string) => void;
}>();

const emit = defineEmits<{
  updateType: [type: string],
}>();

const { t } = useI18n();

const currentType = useRouteQuery("type", "rank", { transform: String });
function isCurrent(item: Item): boolean {
  if (currentType.value === item.keyword) {
    return true;
  }

  return false;
}

function onClick(item: Item) {
  if (item.link) {
    return;
  }

  currentType.value = item.keyword;
  emit("updateType", currentType.value);
}
</script>

<template>
  <div class="font-mono second-level-menu-list">
    <div class="flex flex-row-reverse mr-[-4px]">
      <template
        v-for="item in props.items"
        :key="item.title"
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
              {{ t(item.title) }}
            </a>
            <div
              v-if="!item.link"
            >
              {{ t(item.title) }}
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
