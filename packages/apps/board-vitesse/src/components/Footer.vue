<script setup lang="ts">
import { GITHUB_URL } from "@xcpcio/types";
import { availableLocales, loadLanguageAsync } from "~/modules/i18n";

const { t, locale } = useI18n();

async function toggleLocales() {
  const locales = availableLocales;
  const newLocale = locales[(locales.indexOf(locale.value) + 1) % locales.length];
  await loadLanguageAsync(newLocale);
  locale.value = newLocale;
}
</script>

<template>
  <nav flex="~ gap-4" justify-center mt-6 text-xl>
    <RouterLink icon-btn to="/" :title="t('button.home')">
      <div i-ion-balloon-sharp />
    </RouterLink>

    <a icon-btn :title="t('button.toggle_langs')" @click="toggleLocales()">
      <div i-carbon-language />
    </a>

    <button icon-btn :title="t('button.toggle_dark')" @click="toggleDark()">
      <div i="carbon-sun dark:carbon-moon" />
    </button>

    <a icon-btn rel="noreferrer" :href="GITHUB_URL" target="_blank" title="GitHub">
      <div i-carbon-logo-github />
    </a>
  </nav>
</template>
