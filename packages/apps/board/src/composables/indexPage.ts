import type { ContestIndexList } from "@xcpcio/core";

import { computed, reactive, ref, watch } from "vue";
import { useRoute } from "vue-router";
import { getRuntimeConfig } from "./runtimeConfig";

const DISPLAY_NAME_ACRONYMS: Record<string, string> = {
  ccpc: "CCPC",
  icpc: "ICPC",
};
const DISPLAY_NAME_NUMBER_RE = /^\d+(?:st|nd|rd|th)?$/;

export interface IndexBreadcrumb {
  label: string;
  path: string;
}

export interface IndexChildDirectory {
  name: string;
  label: string;
  path: string;
  contestCount: number;
  latestStartTime: number;
}

export interface ContestIndexPathOptions {
  injectedIndexPath?: string;
  knownPaths?: ReadonlySet<string>;
  fallbackPath?: string | null;
  hasDataSource?: boolean;
}

export function splitIndexPath(path: string): string[] {
  return path.split("/").filter(Boolean);
}

export function normalizeIndexPath(path: string | null | undefined): string {
  const segments = splitIndexPath(path ?? "");
  return segments.length > 0
    ? `/${segments.join("/")}`
    : "/";
}

export function formatIndexSegment(segment: string): string {
  return segment
    .split(/[-_]+/)
    .filter(Boolean)
    .map((token) => {
      const lowered = token.toLowerCase();
      if (DISPLAY_NAME_ACRONYMS[lowered]) {
        return DISPLAY_NAME_ACRONYMS[lowered];
      }
      if (DISPLAY_NAME_NUMBER_RE.test(lowered)) {
        return lowered;
      }
      return lowered.charAt(0).toUpperCase() + lowered.slice(1);
    })
    .join(" ");
}

export function formatIndexPathLabel(path: string): string {
  return splitIndexPath(path).map(formatIndexSegment).join(" ");
}

export function buildIndexBreadcrumbs(path: string): IndexBreadcrumb[] {
  const segments = splitIndexPath(path);
  return segments.map((segment, index) => ({
    label: formatIndexSegment(segment),
    path: `/${segments.slice(0, index + 1).join("/")}`,
  }));
}

export function filterContestIndexByPrefix(
  list: ContestIndexList,
  prefix: string,
): ContestIndexList {
  const normalized = normalizeIndexPath(prefix);
  if (normalized === "/") {
    return list;
  }

  const scopedPrefix = `${normalized}/`;
  return list.filter(item => item.boardLink.startsWith(scopedPrefix));
}

export function getIndexChildDirectories(
  list: ContestIndexList,
  prefix: string,
): IndexChildDirectory[] {
  const normalized = normalizeIndexPath(prefix);
  const base = normalized === "/"
    ? "/"
    : `${normalized}/`;
  const directories = new Map<string, IndexChildDirectory>();

  for (const item of list) {
    if (!item.boardLink.startsWith(base)) {
      continue;
    }

    const rest = item.boardLink.slice(base.length);
    const [name, ...tail] = rest.split("/");
    if (!name || tail.length === 0) {
      continue;
    }

    let directory = directories.get(name);
    if (directory === undefined) {
      directory = {
        name,
        label: formatIndexSegment(name),
        path: `${base}${name}`,
        contestCount: 0,
        latestStartTime: 0,
      };
      directories.set(name, directory);
    }

    directory.contestCount += 1;

    const startTime = item.contest.startTime.valueOf();
    if (Number.isFinite(startTime) && startTime > directory.latestStartTime) {
      directory.latestStartTime = startTime;
    }
  }

  return [
    ...directories.values(),
  ].sort((a, b) => {
    if (a.latestStartTime !== b.latestStartTime) {
      return b.latestStartTime - a.latestStartTime;
    }
    return a.label.localeCompare(b.label);
  });
}

export function getIndexSiblingDirectories(
  list: ContestIndexList,
  path: string,
): IndexChildDirectory[] {
  const segments = splitIndexPath(normalizeIndexPath(path));
  if (segments.length <= 1) {
    return [];
  }

  const parent = `/${segments.slice(0, -1).join("/")}`;
  return getIndexChildDirectories(list, parent);
}

export function collectIndexDirectoryPaths(list: ContestIndexList): string[] {
  const paths = new Set<string>();

  for (const item of list) {
    const segments = splitIndexPath(item.boardLink);
    for (let size = 1; size < segments.length; size += 1) {
      paths.add(`/${segments.slice(0, size).join("/")}`);
    }
  }

  return [...paths].sort();
}

const knownIndexPaths = reactive(new Set<string>());
const fallbackIndexPath = ref<string | null>(null);

export function markIndexPaths(paths: Iterable<string>): void {
  for (const path of paths) {
    const normalized = normalizeIndexPath(path);
    if (normalized !== "/") {
      knownIndexPaths.add(normalized);
    }
  }
}

export function setFallbackIndexPath(path: string): void {
  fallbackIndexPath.value = normalizeIndexPath(path);
}

export function clearFallbackIndexPath(): void {
  fallbackIndexPath.value = null;
}

export function resetIndexPageState(): void {
  knownIndexPaths.clear();
  fallbackIndexPath.value = null;
}

export function getInjectedIndexPath(): string | undefined {
  if (typeof window === "undefined") {
    return undefined;
  }

  const config = window.RUNTIME_CONFIG;
  if (config?.pageType !== "index" || typeof config.indexPath !== "string") {
    return undefined;
  }

  return config.indexPath;
}

export function isContestIndexPath(
  path: string,
  options: ContestIndexPathOptions = {},
): boolean {
  const {
    injectedIndexPath,
    knownPaths = knownIndexPaths,
    fallbackPath = fallbackIndexPath.value,
    hasDataSource = false,
  } = options;

  const normalized = normalizeIndexPath(path);
  if (normalized === "/") {
    return true;
  }
  if (hasDataSource) {
    return false;
  }
  if (knownPaths.has(normalized)) {
    return true;
  }
  if (fallbackPath !== null && normalizeIndexPath(fallbackPath) === normalized) {
    return true;
  }

  return injectedIndexPath !== undefined
    && normalizeIndexPath(injectedIndexPath) === normalized;
}

export function useIsContestIndexPage() {
  const route = useRoute();

  return computed(() => {
    if (typeof window === "undefined") {
      // Only the root path is prerendered; directory paths are resolved
      // from the contest index at runtime.
      return route.path === "/";
    }

    return isContestIndexPath(route.path, {
      injectedIndexPath: getInjectedIndexPath(),
      hasDataSource: Boolean(getRuntimeConfig().dataSource),
    });
  });
}

/**
 * Clear the one-shot 404 fallback once the route leaves that path, so a
 * transient board 404 can never keep treating a real contest as an index.
 */
export function useContestIndexFallbackCleanup(): void {
  const route = useRoute();

  watch(
    () => route.path,
    (path) => {
      if (fallbackIndexPath.value !== null
        && fallbackIndexPath.value !== normalizeIndexPath(path)) {
        fallbackIndexPath.value = null;
      }
    },
  );
}
