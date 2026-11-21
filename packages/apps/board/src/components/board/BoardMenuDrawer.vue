<script setup lang="ts">
import type { Item } from "@board/components/board/SecondLevelMenu.vue";
import type { Rank } from "@xcpcio/core";

import InfoModal from "@board/components/board/InfoModal.vue";
import SecondLevelMenu from "@board/components/board/SecondLevelMenu.vue";
import { useEventListener } from "@vueuse/core";
import { useToast } from "vue-toast-notification";

const props = defineProps<{
  rank: Rank;
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
const $toast = useToast();
const { copy, isSupported } = useClipboard();
const isOpen = ref(false);
const isHiddenInfoModal = ref(true);

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

function openInfo() {
  close();
  isHiddenInfoModal.value = false;
}

function checkClipboard() {
  if (!isSupported.value) {
    $toast.warning("clipboard is not supported");
    return false;
  }

  return true;
}

function copyLink() {
  if (!checkClipboard()) {
    return;
  }

  copy(window.location.href);
  $toast.success("copy success");
  close();
}

function copyCode() {
  if (!checkClipboard()) {
    return;
  }

  const code = `<iframe src="${window.location.href}" border="0" frameborder="no" framespacing="0" allowfullscreen="true" style="width: 100%; height: 720px"></iframe>`;
  copy(code);
  $toast.success("copy success");
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

          <div class="mt-6 border-t border-gray-200 pt-4 dark:border-gray-700">
            <div class="mb-2 text-xs font-semibold uppercase tracking-wide opacity-60">
              {{ t("common.actions") }}
            </div>

            <div class="flex flex-col gap-1">
              <a
                v-if="rank.contest.socialMedia?.bilibili"
                :href="rank.contest.socialMedia.bilibili"
                target="_blank"
                rel="noopener noreferrer"
                title="Watch on Bilibili"
                class="flex min-h-11 w-full items-center gap-2.5 rounded-lg border border-transparent px-3 py-2 text-left text-sm font-semibold text-gray-700 transition hover:bg-gray-100 hover:text-teal-700 dark:text-gray-200 dark:hover:bg-gray-700 dark:hover:text-teal-300"
                @click="close"
              >
                <div i-ri:bilibili-line class="text-xl opacity-75" />
                <span>Bilibili Live</span>
              </a>

              <a
                v-if="rank.contest.socialMedia?.youtube"
                :href="rank.contest.socialMedia.youtube"
                target="_blank"
                rel="noopener noreferrer"
                title="Watch on YouTube"
                class="flex min-h-11 w-full items-center gap-2.5 rounded-lg border border-transparent px-3 py-2 text-left text-sm font-semibold text-gray-700 transition hover:bg-gray-100 hover:text-teal-700 dark:text-gray-200 dark:hover:bg-gray-700 dark:hover:text-teal-300"
                @click="close"
              >
                <div i-ri:youtube-line class="text-xl opacity-75" />
                <span>YouTube</span>
              </a>

              <button
                type="button"
                class="flex min-h-11 w-full items-center gap-2.5 rounded-lg border border-transparent px-3 py-2 text-left text-sm font-semibold text-gray-700 transition hover:bg-gray-100 hover:text-teal-700 dark:text-gray-200 dark:hover:bg-gray-700 dark:hover:text-teal-300"
                @click="openInfo"
              >
                <div i-material-symbols-info-outline class="text-xl opacity-75" />
                <span>{{ t("type_menu.info") }}</span>
              </button>

              <button
                type="button"
                class="flex min-h-11 w-full items-center gap-2.5 rounded-lg border border-transparent px-3 py-2 text-left text-sm font-semibold text-gray-700 transition hover:bg-gray-100 hover:text-teal-700 dark:text-gray-200 dark:hover:bg-gray-700 dark:hover:text-teal-300"
                @click="copyLink"
              >
                <div i-material-symbols-link-rounded class="text-xl opacity-75" />
                <span>{{ t("common.copy_link") }}</span>
              </button>

              <button
                type="button"
                class="flex min-h-11 w-full items-center gap-2.5 rounded-lg border border-transparent px-3 py-2 text-left text-sm font-semibold text-gray-700 transition hover:bg-gray-100 hover:text-teal-700 dark:text-gray-200 dark:hover:bg-gray-700 dark:hover:text-teal-300"
                @click="copyCode"
              >
                <div i-material-symbols-code class="text-xl opacity-75" />
                <span>{{ t("common.copy_embed_code") }}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Teleport>

  <InfoModal
    v-if="!isHiddenInfoModal"
    v-model:is-hidden="isHiddenInfoModal"
    :rank="rank"
  />
</template>
