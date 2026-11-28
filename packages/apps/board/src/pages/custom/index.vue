<script setup lang="ts">
import type { RuntimeComponent, RuntimeConfig, RuntimePageType } from "@board/types";
import {
  clearStoredRuntimeConfig,
  getRuntimeConfig,
  setStoredRuntimeConfig,
} from "@board/composables/runtimeConfig";
import { runtimeConfigAnnotations, runtimeConfigHints } from "./runtimeConfigSchema";

const router = useRouter();

const defaultConfig: RuntimeConfig = {
  pageType: "contest",
  component: "board",
  dataHost: "/data/",
  dataSource: "",
  defaultLang: "en",
};

const pageTypes: RuntimePageType[] = ["index", "contest", "custom"];
const components: RuntimeComponent[] = ["board", "resolver", "balloon", "countdown"];

const configText = ref(JSON.stringify({
  ...defaultConfig,
  ...getRuntimeConfig(),
}, null, 2));
const errorMessage = ref("");
const successMessage = ref("");

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function parseConfig(): RuntimeConfig | null {
  errorMessage.value = "";
  successMessage.value = "";

  let parsed: unknown;
  try {
    parsed = JSON.parse(configText.value);
  } catch (error) {
    errorMessage.value = error instanceof Error ? error.message : "Invalid JSON.";
    return null;
  }

  if (!isRecord(parsed)) {
    errorMessage.value = "Runtime config must be a JSON object.";
    return null;
  }

  const config = parsed as RuntimeConfig;

  if (config.pageType && !pageTypes.includes(config.pageType)) {
    errorMessage.value = `pageType must be one of: ${pageTypes.join(", ")}.`;
    return null;
  }

  if (config.component && !components.includes(config.component)) {
    errorMessage.value = `component must be one of: ${components.join(", ")}.`;
    return null;
  }

  if (config.pageType === "contest" && !config.dataSource) {
    errorMessage.value = "dataSource is required when pageType is contest.";
    return null;
  }

  return config;
}

function saveConfig() {
  const config = parseConfig();
  if (!config) {
    return;
  }

  setStoredRuntimeConfig(config);
  successMessage.value = "Runtime config saved.";
}

function applyConfig() {
  const config = parseConfig();
  if (!config) {
    return;
  }

  setStoredRuntimeConfig(config);
  if (config.pageType === "index") {
    router.push("/");
    return;
  }

  // preview routes are named after the component (`/board/`, `/resolver/`,
  // `/balloon/`, `/countdown/`)
  router.push(`/${config.component ?? "board"}/`);
}

function resetConfig() {
  configText.value = JSON.stringify(defaultConfig, null, 2);
  errorMessage.value = "";
  successMessage.value = "";
}

function clearConfig() {
  clearStoredRuntimeConfig();
  successMessage.value = "Saved runtime config cleared.";
  errorMessage.value = "";
}
</script>

<template>
  <div class="mx-auto max-w-4xl px-4 py-8">
    <div class="mb-6 border-b border-gray-200 pb-5 dark:border-gray-800">
      <h1 class="text-2xl font-bold">
        Runtime Config
      </h1>
      <p class="mt-2 text-sm op70">
        Paste a JSON runtime config to preview XCPCIO Board without deployment-side injection.
      </p>
    </div>

    <label
      class="mb-2 block text-sm font-medium"
    >
      Config JSON
    </label>
    <div class="h-96 overflow-hidden border border-gray-200 dark:border-gray-800">
      <CodeEditor
        v-model="configText"
        mode="json"
        :get-hint="runtimeConfigHints"
        :get-annotations="runtimeConfigAnnotations"
      />
    </div>

    <div
      v-if="errorMessage"
      class="mt-3 rounded border border-red-300 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-200"
    >
      {{ errorMessage }}
    </div>

    <div
      v-if="successMessage"
      class="mt-3 rounded border border-teal-300 bg-teal-50 p-3 text-sm text-teal-700 dark:border-teal-800 dark:bg-teal-950 dark:text-teal-200"
    >
      {{ successMessage }}
    </div>

    <div class="mt-5 flex flex-wrap gap-3">
      <button
        btn
        @click="applyConfig"
      >
        Apply
      </button>
      <button
        btn
        @click="saveConfig"
      >
        Save
      </button>
      <button
        btn
        @click="resetConfig"
      >
        Reset Example
      </button>
      <button
        btn
        @click="clearConfig"
      >
        Clear Saved
      </button>
    </div>
  </div>
</template>

<route lang="yaml">
meta:
  layout: default
</route>
