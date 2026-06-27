import type { RuntimeConfig } from "@board/types";

export function getRuntimeConfig(): RuntimeConfig {
  if (typeof window === "undefined") {
    return {};
  }

  const config = window.RUNTIME_CONFIG ?? {};

  return {
    pageType: config.pageType,
    component: config.component,
    dataSource: config.dataSource ?? window.DATA_SOURCE,
    baseUrl: config.baseUrl ?? window.BASE_URL,
    cdnHost: config.cdnHost ?? window.CDN_HOST,
    dataHost: config.dataHost ?? window.DATA_HOST,
    dataRegion: config.dataRegion ?? window.DATA_REGION,
    defaultLang: config.defaultLang ?? window.DEFAULT_LANG,
    refetchInterval: config.refetchInterval ?? window.REFETCH_INTERVAL,
  };
}
