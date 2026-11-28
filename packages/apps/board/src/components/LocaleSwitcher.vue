<script setup lang="ts">
import { buildLocaleUrl } from "@board/composables/locale";
import { getLocaleUrls } from "@board/composables/runtimeConfig";
import { availableLocales, loadLanguageAsync } from "@board/modules/i18n";

const { t, locale } = useI18n();
const route = useRoute();

const switcherRef = ref<HTMLElement | null>(null);
const isOpen = ref(false);

const labels: Record<string, string> = {
  "en": "English",
  "zh-CN": "简体中文",
};

const localeUrls = getLocaleUrls();

function targetUrl(target: string) {
  const base = localeUrls?.[target];
  return base ? buildLocaleUrl(base, route.fullPath) : undefined;
}

const items = computed(() => availableLocales.map((target) => {
  return {
    locale: target,
    label: labels[target] ?? target,
    url: targetUrl(target),
    current: locale.value === target,
  };
}));

function selectLocale(target: string) {
  isOpen.value = false;

  if (target === locale.value) {
    return;
  }

  const url = targetUrl(target);
  if (url) {
    window.location.assign(url);
    return;
  }

  void loadLanguageAsync(target);
}

function onLocaleLinkClick(event: MouseEvent, target: string) {
  const url = targetUrl(target);
  if (url === window.location.href) {
    event.preventDefault();
  }
  isOpen.value = false;
}

onClickOutside(switcherRef, () => {
  isOpen.value = false;
});

onKeyStroke("Escape", () => {
  isOpen.value = false;
});
</script>

<template>
  <div
    ref="switcherRef"
    class="relative"
  >
    <button
      icon-btn
      type="button"
      :title="t('button.toggle_langs')"
      :aria-label="t('button.toggle_langs')"
      aria-haspopup="menu"
      :aria-expanded="isOpen"
      @click="isOpen = !isOpen"
    >
      <div i-carbon-language />
    </button>

    <div
      v-if="isOpen"
      class="absolute right-0 top-full z-50 mt-2 min-w-36 whitespace-nowrap rounded-lg border border-gray-200 bg-white py-1 text-sm shadow-lg dark:border-gray-700 dark:bg-gray-800"
      role="menu"
    >
      <template
        v-for="item in items"
        :key="item.locale"
      >
        <a
          v-if="item.url"
          :href="item.url"
          class="flex items-center justify-between gap-x-4 px-3 py-2 text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
          role="menuitem"
          @click="onLocaleLinkClick($event, item.locale)"
        >
          <span>{{ item.label }}</span>
          <div
            v-if="item.current"
            i-carbon-checkmark
          />
        </a>

        <button
          v-else
          type="button"
          class="flex w-full items-center justify-between gap-x-4 px-3 py-2 text-gray-700 transition-colors hover:bg-gray-100 dark:text-gray-200 dark:hover:bg-gray-700"
          role="menuitem"
          @click="selectLocale(item.locale)"
        >
          <span>{{ item.label }}</span>
          <div
            v-if="item.current"
            i-carbon-checkmark
          />
        </button>
      </template>
    </div>
  </div>
</template>
