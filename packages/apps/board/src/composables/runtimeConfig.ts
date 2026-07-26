import type { RuntimeConfig } from "@board/types";

export const RUNTIME_CONFIG_STORAGE_KEY = "xcpcio-runtime-config";

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

export function getStoredRuntimeConfig(): RuntimeConfig {
  if (typeof window === "undefined") {
    return {};
  }

  try {
    const raw = window.localStorage.getItem(RUNTIME_CONFIG_STORAGE_KEY);
    if (!raw) {
      return {};
    }

    const config = JSON.parse(raw);
    return isRecord(config) ? config : {};
  } catch {
    return {};
  }
}

export function setStoredRuntimeConfig(config: RuntimeConfig) {
  try {
    window.localStorage.setItem(RUNTIME_CONFIG_STORAGE_KEY, JSON.stringify(config));
  } catch {}
}

export function clearStoredRuntimeConfig() {
  try {
    window.localStorage.removeItem(RUNTIME_CONFIG_STORAGE_KEY);
  } catch {}
}

export function getRuntimeBaseUrl() {
  if (typeof window === "undefined") {
    return undefined;
  }

  return window.RUNTIME_CONFIG?.baseUrl ?? window.BASE_URL;
}

export function getRuntimeConfig(): RuntimeConfig {
  if (typeof window === "undefined") {
    return {};
  }

  const storedConfig = getStoredRuntimeConfig();
  const injectedConfig = window.RUNTIME_CONFIG ?? {};
  const config = {
    ...storedConfig,
    ...injectedConfig,
  };

  return {
    pageType: config.pageType,
    component: config.component,
    dataSource: config.dataSource ?? window.DATA_SOURCE,
    baseUrl: injectedConfig.baseUrl ?? window.BASE_URL,
    cdnHost: injectedConfig.cdnHost ?? window.CDN_HOST,
    dataHost: config.dataHost ?? window.DATA_HOST,
    dataRegion: config.dataRegion ?? window.DATA_REGION,
    defaultLang: config.defaultLang ?? window.DEFAULT_LANG,
    refetchInterval: config.refetchInterval ?? window.REFETCH_INTERVAL,
  };
}
