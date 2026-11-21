<script setup lang="ts">
import type { Item } from "@board/components/board/SecondLevelMenu.vue";

import SecondLevelMenu from "@board/components/board/SecondLevelMenu.vue";
import { useEventListener } from "@vueuse/core";

const props = defineProps<{
  groupItems: Array<Item>;
  typeItems: Array<Item>;
  currentGroup: string;
  currentType: string;
}>();

const emit = defineEmits<{
  (event: "update:currentGroup", value: string): void;
  (event: "update:currentType", value: string): void;
  (event: "changeGroup", value: string): void;
  (event: "changeType", value: string): void;
}>();

const { t } = useI18n();
const isOpen = ref(false);

const groupModel = computed({
  get: () => props.currentGroup,
  set: value => emit("update:currentGroup", value),
});

const typeModel = computed({
  get: () => props.currentType,
  set: value => emit("update:currentType", value),
});

function open() {
  isOpen.value = true;
}

function close() {
  isOpen.value = false;
}

function onGroupChange(value: string) {
  emit("changeGroup", value);
  close();
}

function onTypeChange(value: string) {
  emit("changeType", value);
  close();
}

useEventListener(document, "keydown", (event) => {
  if (event.key === "Escape" && isOpen.value) {
    close();
  }
});
</script>

<template>
  <button
    type="button"
    class="fixed left-3 top-3 z-50 inline-flex h-11 w-11 items-center justify-center rounded-full bg-white/95 text-gray-700 shadow-md backdrop-blur dark:bg-gray-800/95 dark:text-gray-200"
    aria-label="Open board menu"
    :aria-expanded="isOpen"
    data-testid="board-menu-trigger"
    @click="open"
  >
    <div i-material-symbols-menu text-xl />
  </button>

  <Teleport to="body">
    <div
      v-show="isOpen"
      class="fixed inset-0 z-1996 bg-black/40"
      data-testid="board-menu-drawer"
      @click.self="close"
    >
      <div
        role="dialog"
        aria-modal="true"
        class="absolute left-0 top-0 flex h-full w-[82%] max-w-xs flex-col bg-white shadow-xl dark:bg-gray-800"
      >
        <div class="flex shrink-0 items-center justify-between border-b border-gray-200 px-4 py-3 dark:border-gray-700">
          <h2 class="text-lg font-semibold">
            {{ t("common.menu") }}
          </h2>

          <button
            type="button"
            class="inline-flex h-11 w-11 items-center justify-center rounded-lg text-gray-500 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700"
            aria-label="Close menu"
            @click="close"
          >
            <div i-material-symbols-close text-xl />
          </button>
        </div>

        <div class="flex-1 overflow-y-auto px-4 py-4">
          <div class="mb-6">
            <div class="mb-2 text-xs font-semibold uppercase tracking-wide opacity-60">
              {{ t("standings.group") }}
            </div>

            <SecondLevelMenu
              v-model:current-item="groupModel"
              :items="groupItems"
              query-param-name="group"
              vertical
              :on-change="onGroupChange"
            />
          </div>

          <div>
            <div class="mb-2 text-xs font-semibold uppercase tracking-wide opacity-60">
              {{ t("standings.view") }}
            </div>

            <SecondLevelMenu
              v-model:current-item="typeModel"
              :items="typeItems"
              query-param-name="type"
              vertical
              :on-change="onTypeChange"
            />
          </div>
        </div>
      </div>
    </div>
  </Teleport>
</template>
