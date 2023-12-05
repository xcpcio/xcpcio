export const TITLE_SUFFIX = "Board - XCPCIO";
export const BALLOON_TITLE_SUFFIX = "Balloon - XCPCIO";
export const RESOLVER_TITLE_SUFFIX = "Resolver - XCPCIO";
export const COUNTDOWN_TITLE_SUFFIX = "Countdown - XCPCIO";

export const CDN_HOST = computed(() => {
  if (!window) {
    return "";
  }

  return window.CDN_HOST;
});

export const DATA_HOST = computed(() => {
  if (!window) {
    return "";
  }

  return window.DATA_HOST;
});

export const DATA_REGION = computed(() => {
  if (!window) {
    return "";
  }

  return window.DATA_REGION;
});
