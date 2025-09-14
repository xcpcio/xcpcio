export const APP_VERSION = __APP_VERSION__;
export const GITHUB_URL = __GITHUB_URL__;
export const GITHUB_SHA = __GITHUB_SHA__;
export const XCPCIO_HOME = __XCPCIO_HOME__;

export const TITLE_SUFFIX = "Board - XCPCIO";
export const RATING_TITLE_SUFFIX = "Rating - XCPCIO";
export const BALLOON_TITLE_SUFFIX = "Balloon - XCPCIO";
export const RESOLVER_TITLE_SUFFIX = "Resolver - XCPCIO";
export const COUNTDOWN_TITLE_SUFFIX = "Countdown - XCPCIO";
export const SUBMISSION_TITLE_SUFFIX = "Submission - XCPCIO";

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

export const RATING_DATA_HOST = computed(() => {
  const dataHost = DATA_HOST.value;
  return dataHost.replace("/data/", "/rating-data/");
});

export const DATA_REGION = computed(() => {
  if (!window) {
    return "";
  }

  return window.DATA_REGION;
});
