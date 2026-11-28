import type { ContestIndexList } from "@xcpcio/core";

import {
  buildIndexBreadcrumbs,
  collectIndexDirectoryPaths,
  filterContestIndexByPrefix,
  formatIndexPathLabel,
  formatIndexSegment,
  getIndexChildDirectories,
  getInjectedIndexPath,
  isContestIndexPath,
  normalizeIndexPath,
  resetIndexPageState,
  setFallbackIndexPath,
  useContestIndexFallbackCleanup,
} from "@board/composables/indexPage";
import { mount } from "@vue/test-utils";
import { createContestIndexList } from "@xcpcio/core";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { defineComponent, nextTick } from "vue";
import { createMemoryHistory, createRouter } from "vue-router";

function indexLeaf(boardLink: string, name: string, startTime: number) {
  return {
    config: {
      contest_name: name,
      start_time: startTime,
      end_time: startTime + 3600,
      frozen_time: 0,
    },
    board_link: boardLink,
  };
}

const contestIndexTree = {
  icpc: {
    "51st": {
      shenyang: indexLeaf("/icpc/51st/shenyang", "Shenyang", 1760000000),
      warmup: indexLeaf("/icpc/51st/warmup", "Warmup", 1759900000),
    },
    "50th": {
      nanjing: indexLeaf("/icpc/50th/nanjing", "Nanjing", 1700000000000),
    },
  },
  ccpc: {
    "12th": {
      changchun: indexLeaf("/ccpc/12th/changchun", "Changchun", 1748000000),
    },
  },
  camp: {
    tsinghua: {
      2025: {
        day1: indexLeaf("/camp/tsinghua/2025/day1", "Day 1", 1740000000),
        day2: indexLeaf("/camp/tsinghua/2025/day2", "Day 2", 1740100000),
      },
    },
  },
};

const contestIndexList: ContestIndexList = createContestIndexList(contestIndexTree);

beforeEach(() => {
  resetIndexPageState();
});

afterEach(() => {
  resetIndexPageState();
  delete window.RUNTIME_CONFIG;
  window.localStorage.clear();
});

describe("index path formatting", () => {
  it("formats display names like the server", () => {
    expect(formatIndexSegment("ccpc")).toBe("CCPC");
    expect(formatIndexSegment("12th")).toBe("12th");
    expect(formatIndexSegment("provincial-contest")).toBe("Provincial Contest");
    expect(formatIndexSegment("online_qualification_1")).toBe("Online Qualification 1");
    expect(formatIndexPathLabel("/camp/tsinghua/2024/day1")).toBe("Camp Tsinghua 2024 Day1");
  });

  it("normalizes paths and builds breadcrumbs", () => {
    expect(normalizeIndexPath("")).toBe("/");
    expect(normalizeIndexPath("/")).toBe("/");
    expect(normalizeIndexPath("ccpc/12th/")).toBe("/ccpc/12th");
    expect(buildIndexBreadcrumbs("/ccpc/12th")).toEqual([
      { label: "CCPC", path: "/ccpc" },
      { label: "12th", path: "/ccpc/12th" },
    ]);
    expect(buildIndexBreadcrumbs("/")).toEqual([]);
  });
});

describe("index scoping", () => {
  it("filters contests by segment boundary", () => {
    expect(filterContestIndexByPrefix(contestIndexList, "/").length).toBe(6);
    expect(filterContestIndexByPrefix(contestIndexList, "/icpc/51st").length).toBe(2);
    expect(filterContestIndexByPrefix(contestIndexList, "/icpc/51st2")).toEqual([]);
    expect(filterContestIndexByPrefix(contestIndexList, "/ccpc/12th/changchun")).toEqual([]);
  });

  it("derives child directories with counts and newest-first order", () => {
    const icpc = getIndexChildDirectories(contestIndexList, "/icpc");
    expect(icpc.map(directory => directory.label)).toEqual(["51st", "50th"]);
    expect(icpc[0]).toMatchObject({
      name: "51st",
      path: "/icpc/51st",
      contestCount: 2,
    });

    const camp = getIndexChildDirectories(contestIndexList, "/camp");
    expect(camp).toHaveLength(1);
    expect(camp[0]).toMatchObject({
      label: "Tsinghua",
      path: "/camp/tsinghua",
      contestCount: 2,
    });

    const campYear = getIndexChildDirectories(contestIndexList, "/camp/tsinghua");
    expect(campYear).toHaveLength(1);
    expect(campYear[0]).toMatchObject({
      label: "2025",
      path: "/camp/tsinghua/2025",
      contestCount: 2,
    });
    expect(getIndexChildDirectories(contestIndexList, "/camp/tsinghua/2025")).toEqual([]);
    expect(getIndexChildDirectories(contestIndexList, "/ccpc/12th")).toEqual([]);
  });

  it("collects every internal directory path", () => {
    expect(collectIndexDirectoryPaths(contestIndexList)).toEqual([
      "/camp",
      "/camp/tsinghua",
      "/camp/tsinghua/2025",
      "/ccpc",
      "/ccpc/12th",
      "/icpc",
      "/icpc/50th",
      "/icpc/51st",
    ]);
  });
});

describe("index page kind", () => {
  it("matches the root, known directories, injected path and one-shot fallback", () => {
    expect(isContestIndexPath("/")).toBe(true);
    expect(isContestIndexPath("/ccpc", { knownPaths: new Set(["/ccpc"]) })).toBe(true);
    expect(isContestIndexPath("/ccpc/12th", { injectedIndexPath: "/ccpc/12th" })).toBe(true);
    expect(isContestIndexPath("/ccpc/12th/changchun", { injectedIndexPath: "/ccpc/12th" })).toBe(false);
    expect(isContestIndexPath("/ccpc", { knownPaths: new Set(["/ccpc"]), hasDataSource: true })).toBe(false);

    expect(isContestIndexPath("/ccpc/12th")).toBe(false);
    setFallbackIndexPath("/ccpc/12th");
    expect(isContestIndexPath("/ccpc/12th")).toBe(true);
    expect(isContestIndexPath("/ccpc/12th/changchun")).toBe(false);
  });

  it("only trusts the injected page type, not a stored config", () => {
    window.localStorage.setItem(
      "xcpcio-runtime-config",
      JSON.stringify({ pageType: "index", indexPath: "/stored" }),
    );

    expect(getInjectedIndexPath()).toBeUndefined();

    window.RUNTIME_CONFIG = { pageType: "index", indexPath: "/ccpc/12th" };
    expect(getInjectedIndexPath()).toBe("/ccpc/12th");

    window.RUNTIME_CONFIG = { pageType: "contest", indexPath: "/ccpc/12th" };
    expect(getInjectedIndexPath()).toBeUndefined();
  });

  it("clears the fallback once the route leaves that path", async () => {
    setFallbackIndexPath("/ccpc/12th");

    const router = createRouter({
      history: createMemoryHistory(),
      routes: [
        { path: "/", component: { template: "<div />" } },
        { path: "/:pathMatch(.*)*", component: { template: "<div />" } },
      ],
    });
    const Host = defineComponent({
      setup() {
        useContestIndexFallbackCleanup();
        return () => null;
      },
    });

    const wrapper = mount(Host, { global: { plugins: [router] } });
    await router.push("/ccpc/12th");
    await router.isReady();
    expect(isContestIndexPath("/ccpc/12th")).toBe(true);

    await router.push("/icpc/49th/nanjing");
    await nextTick();
    expect(isContestIndexPath("/ccpc/12th")).toBe(false);

    wrapper.unmount();
  });
});
