<script setup lang="ts">
import { GITHUB_URL } from "@xcpcio/types";
import { availableLocales, loadLanguageAsync } from "~/modules/i18n";

const { t, locale } = useI18n();
const { y: scroll } = useWindowScroll();

function toTop() {
  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
}

async function toggleLocales() {
  const locales = availableLocales;
  const newLocale = locales[(locales.indexOf(locale.value) + 1) % locales.length];
  await loadLanguageAsync(newLocale);
  locale.value = newLocale;
}
</script>

<template>
  <header class="header z-40">
    <!-- <RouterLink
      class="absolute h-12 w-12 select-none outline-none xl:fixed m-6"
      text-xl
      to="/"
      focusable="false"
    >
      <div i-ion-balloon-sharp />
    </RouterLink> -->

    <button
      title="Scroll to top"
      fixed bottom-6 right-6 z-100 h-10 w-10 rounded-full transition duration-300 print:hidden hover-bg-hex-8883 hover:op100
      :class="scroll > 300 ? 'op30' : 'op0! pointer-events-none'"
      @click="toTop()"
    >
      <div i-ri-arrow-up-line />
    </button>

    <nav class="nav xl:fixed" text-xl>
      <div class="spacer" />
      <div class="right" print:op0>
        <RouterLink
          icon-btn
          :title="t('button.home')"
          to="/"
          focusable="false"
        >
          <div i-ion-balloon-sharp />
        </RouterLink>

        <a
          icon-btn
          :title="t('button.toggle_langs')"
          @click="toggleLocales()"
        >
          <div i-carbon-language />
        </a>

        <a
          icon-btn
          :title="t('button.toggle_dark')"
          @click="toggleDark()"
        >
          <div i="carbon-sun dark:carbon-moon" />
        </a>

        <a
          icon-btn
          rel="noreferrer"
          :href="GITHUB_URL"
          target="_blank"
          title="GitHub"
        >
          <div i-carbon-logo-github />
        </a>
      </div>
    </nav>
  </header>
</template>

<style scoped>
.header h1 {
  margin-bottom: 0;
}

.logo {
  position: absolute;
  top: 1.5rem;
  left: 1.5rem;
}

.nav {
  padding: 1rem;
  width: 100%;
  display: grid;
  grid-template-columns: auto max-content;
  box-sizing: border-box;
}

.nav > * {
  margin: auto;
}

.nav img {
  margin-bottom: 0;
}

.nav a {
  cursor: pointer;
  text-decoration: none;
  color: inherit;
  transition: opacity 0.2s ease;
  opacity: 0.6;
  outline: none;
}

.nav a:hover {
  opacity: 1;
  text-decoration-color: inherit;
}

.nav .right {
  display: grid;
  grid-gap: 1.2rem;
  grid-auto-flow: column;
}

.nav .right > * {
  margin: auto;
}
</style>
