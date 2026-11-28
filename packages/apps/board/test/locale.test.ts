import { afterEach, describe, expect, it } from "vitest";
import { buildLocaleUrl, findLocaleForPath } from "../src/composables/locale";
import { getLocaleUrls } from "../src/composables/runtimeConfig";

const LOCALE_URLS = {
  "en": "https://xcpcio.com/board",
  "zh-CN": "https://xcpcio.com/zh/board",
};

describe("buildLocaleUrl", () => {
  it("joins an absolute base and preserves query and hash", () => {
    expect(
      buildLocaleUrl("https://xcpcio.com/zh/board", "/icpc/50th/ecf?group=all#team-3"),
    ).toBe("https://xcpcio.com/zh/board/icpc/50th/ecf?group=all#team-3");
  });

  it("normalizes trailing slashes and root paths", () => {
    expect(
      buildLocaleUrl("https://xcpcio.com/board/", "/", "https://xcpcio.com"),
    ).toBe("https://xcpcio.com/board/");

    expect(
      buildLocaleUrl("/zh/board/", "", "https://xcpcio.com"),
    ).toBe("https://xcpcio.com/zh/board/");
  });

  it("supports relative bases on a local origin", () => {
    expect(
      buildLocaleUrl("/zh/board", "/icpc/50th/ecf", "http://localhost:3333"),
    ).toBe("http://localhost:3333/zh/board/icpc/50th/ecf");
  });
});

describe("findLocaleForPath", () => {
  it("matches locales by path segment", () => {
    expect(findLocaleForPath(LOCALE_URLS, "/board/icpc/50th/ecf", "https://xcpcio.com")).toBe("en");
    expect(findLocaleForPath(LOCALE_URLS, "/zh/board/icpc/50th/ecf", "https://xcpcio.com")).toBe("zh-CN");
    expect(findLocaleForPath(LOCALE_URLS, "/board", "https://xcpcio.com")).toBe("en");
    expect(findLocaleForPath(LOCALE_URLS, "/zh/board", "https://xcpcio.com")).toBe("zh-CN");
    expect(findLocaleForPath(LOCALE_URLS, "/icpc/50th/ecf", "https://xcpcio.com")).toBeUndefined();
    expect(findLocaleForPath(LOCALE_URLS, "/boardroom", "https://xcpcio.com")).toBeUndefined();
  });

  it("does not match a locale base on another host", () => {
    expect(findLocaleForPath(LOCALE_URLS, "/board/icpc/50th/ecf", "https://board.xcpcio.com")).toBeUndefined();
    expect(findLocaleForPath(LOCALE_URLS, "/icpc/50th/ecf", "https://board.xcpcio.com")).toBeUndefined();
  });

  it("returns undefined without a map", () => {
    expect(findLocaleForPath(undefined, "/board/icpc", "https://xcpcio.com")).toBeUndefined();
  });
});

describe("getLocaleUrls", () => {
  afterEach(() => {
    delete window.RUNTIME_CONFIG;
  });

  it("reads only the injected locale URL map", () => {
    window.RUNTIME_CONFIG = { localeUrls: LOCALE_URLS };

    expect(getLocaleUrls()).toEqual(LOCALE_URLS);
  });

  it("ignores an empty or invalid map", () => {
    window.RUNTIME_CONFIG = {
      localeUrls: { en: "" },
    };

    expect(getLocaleUrls()).toBeUndefined();
  });
});
