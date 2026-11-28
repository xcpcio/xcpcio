<script setup lang="ts">
import type { IndexBreadcrumb, IndexChildDirectory } from "@board/composables/indexPage";

import { useEventListener, useScrollLock } from "@vueuse/core";
import { nextTick, ref, watch } from "vue";
import { useRoute } from "vue-router";

const props = defineProps<{
  directories: IndexChildDirectory[];
  breadcrumbs?: IndexBreadcrumb[];
}>();

const { t } = useI18n();
const route = useRoute();

const isOpen = ref(false);
const isLeaving = ref(false);
const triggerEl = ref<HTMLButtonElement | null>(null);
const closeButtonEl = ref<HTMLButtonElement | null>(null);
const panelEl = ref<HTMLElement | null>(null);
const listEl = ref<HTMLElement | null>(null);
const crumbs = computed(() => props.breadcrumbs ?? []);

const scrollLocked = useScrollLock(
  typeof document === "undefined"
    ? null
    : document.body,
);

watch(isOpen, (open) => {
  scrollLocked.value = open;
});

async function open() {
  isOpen.value = true;
  await nextTick();
  closeButtonEl.value?.focus();
}

function close(options: { restoreFocus?: boolean } = {}) {
  const { restoreFocus = true } = options;

  if (!isOpen.value) {
    return;
  }

  isOpen.value = false;

  if (restoreFocus) {
    triggerEl.value?.focus();
  }
}

function onKeydown(event: KeyboardEvent) {
  if (!isOpen.value) {
    return;
  }

  if (event.key === "Escape") {
    event.preventDefault();
    close();
    return;
  }

  if (event.key !== "Tab") {
    return;
  }

  const panel = panelEl.value;
  if (!panel) {
    return;
  }

  const focusables = Array.from(
    panel.querySelectorAll<HTMLElement>(
      "a[href], button:not([disabled]), [tabindex]:not([tabindex=\"-1\"])",
    ),
  );

  if (focusables.length === 0) {
    return;
  }

  const first = focusables[0];
  const last = focusables[focusables.length - 1];
  const active = document.activeElement as HTMLElement | null;

  if (active === null || !panel.contains(active)) {
    event.preventDefault();
    (event.shiftKey ? last : first).focus();
  } else if (event.shiftKey && active === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && active === last) {
    event.preventDefault();
    first.focus();
  }
}

useEventListener(
  typeof document === "undefined"
    ? null
    : document,
  "keydown",
  onKeydown,
);

// The drawer stays open while browsing between sections; it only closes once
// the current directory has no more sections (a leaf).
watch(
  () => props.directories.length,
  (length) => {
    if (length === 0) {
      close({ restoreFocus: false });
    }
  },
);

watch(
  () => route.path,
  async () => {
    if (!isOpen.value) {
      return;
    }

    await nextTick();

    if (!isOpen.value || props.directories.length === 0) {
      return;
    }

    if (listEl.value) {
      listEl.value.scrollTop = 0;
    }

    // The clicked link is gone after the list re-renders, so keep focus
    // inside the modal.
    panelEl.value?.focus({ preventScroll: true });
  },
);
</script>

<template>
  <div v-if="directories.length || isOpen || isLeaving">
    <button
      v-if="directories.length"
      ref="triggerEl"
      type="button"
      class="inline-flex min-h-10 cursor-pointer items-center gap-2 rounded-full border border-gray-300 px-3 py-1.5 text-sm text-inherit transition hover:border-teal-600 hover:text-teal-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 dark:border-gray-600 dark:hover:border-teal-400 dark:hover:text-teal-300"
      aria-haspopup="dialog"
      aria-controls="index-browse-drawer"
      :aria-expanded="isOpen"
      data-testid="index-browse-trigger"
      @click="open()"
    >
      <span i-carbon-categories class="op60" aria-hidden="true" />
      <span>{{ t("index.browse") }}</span>
      <span class="font-mono text-xs op50">{{ directories.length }}</span>
      <span i-carbon-chevron-down class="op40" aria-hidden="true" />
    </button>

    <Teleport to="body">
      <Transition
        name="browse-drawer"
        @before-leave="isLeaving = true"
        @after-leave="isLeaving = false"
      >
        <div
          v-if="isOpen"
          class="fixed inset-0 z-1996 bg-black/40"
          data-testid="index-browse-backdrop"
          @click.self="close()"
        >
          <aside
            id="index-browse-drawer"
            ref="panelEl"
            role="dialog"
            aria-modal="true"
            aria-labelledby="index-browse-drawer-title"
            tabindex="-1"
            class="browse-drawer-panel absolute inset-y-0 left-0 flex w-[86%] max-w-xs flex-col bg-white shadow-xl outline-none dark:bg-gray-800"
            data-testid="index-browse-drawer"
          >
            <div class="flex shrink-0 items-start justify-between gap-3 border-b border-gray-200 px-4 pb-3 pt-4 dark:border-gray-700">
              <div class="min-w-0">
                <h2
                  id="index-browse-drawer-title"
                  class="font-serif text-xl font-normal"
                >
                  {{ t("index.browse") }}
                </h2>

                <nav
                  v-if="crumbs.length"
                  class="mt-1 flex flex-wrap items-center gap-x-1.5 gap-y-0.5 text-xs op60"
                  aria-label="Breadcrumb"
                >
                  <RouterLink
                    class="text-inherit hover:underline"
                    to="/"
                  >
                    {{ t("index.all_contests") }}
                  </RouterLink>

                  <template
                    v-for="(crumb, index) in crumbs"
                    :key="crumb.path"
                  >
                    <span aria-hidden="true">/</span>
                    <RouterLink
                      v-if="index < crumbs.length - 1"
                      class="text-inherit hover:underline"
                      :to="crumb.path"
                    >
                      {{ crumb.label }}
                    </RouterLink>
                    <span v-else class="op100">{{ crumb.label }}</span>
                  </template>
                </nav>
              </div>

              <button
                ref="closeButtonEl"
                type="button"
                class="inline-flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-lg text-gray-500 transition hover:bg-gray-100 hover:text-teal-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-teal-300"
                :aria-label="t('common.close')"
                @click="close()"
              >
                <span i-carbon-close class="text-xl" aria-hidden="true" />
              </button>
            </div>

            <div
              ref="listEl"
              class="flex-1 overflow-y-auto px-3 py-4"
            >
              <div class="mb-2 flex items-center justify-between px-1">
                <span class="text-xs font-semibold uppercase tracking-wide op60">
                  {{ t("index.sections") }}
                </span>
                <span class="font-mono text-xs op50">{{ directories.length }}</span>
              </div>

              <nav
                class="flex flex-col gap-0.5"
                data-testid="index-browse-sections"
              >
                <RouterLink
                  v-for="directory in directories"
                  :key="directory.path"
                  :to="directory.path"
                  class="flex min-h-11 items-center justify-between gap-3 rounded-lg px-3 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-100 hover:text-teal-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 dark:text-gray-200 dark:hover:bg-gray-700 dark:hover:text-teal-300"
                >
                  <span class="min-w-0 truncate">{{ directory.label }}</span>
                  <span class="flex shrink-0 items-center gap-1.5">
                    <span class="font-mono text-xs font-normal op50">{{ directory.contestCount }}</span>
                    <span i-carbon-chevron-right class="op30" aria-hidden="true" />
                  </span>
                </RouterLink>
              </nav>
            </div>
          </aside>
        </div>
      </Transition>
    </Teleport>
  </div>
</template>

<style scoped>
.browse-drawer-enter-active,
.browse-drawer-leave-active {
  transition: opacity 200ms ease;
}

.browse-drawer-enter-active .browse-drawer-panel,
.browse-drawer-leave-active .browse-drawer-panel {
  transition: transform 200ms cubic-bezier(0.22, 1, 0.36, 1);
}

.browse-drawer-enter-from,
.browse-drawer-leave-to {
  opacity: 0;
}

.browse-drawer-enter-from .browse-drawer-panel,
.browse-drawer-leave-to .browse-drawer-panel {
  transform: translateX(-100%);
}

@media (prefers-reduced-motion: reduce) {
  .browse-drawer-enter-active,
  .browse-drawer-leave-active,
  .browse-drawer-enter-active .browse-drawer-panel,
  .browse-drawer-leave-active .browse-drawer-panel {
    transition: none;
  }
}
</style>
