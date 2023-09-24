import type { SelectOptionItem } from "@xcpcio/core";

export function getLocalStorageKeyForFilterOrganizations() {
  const route = useRoute();
  const key = `filter-organizations-${route.path}`;

  return key;
}

export function getLocalStorageKeyForFilterTeams() {
  const route = useRoute();
  const key = `filter-teams-${route.path}`;

  return key;
}

export function useLocalStorageForFilterOrganizations() {
  const route = useRoute();
  const key = `filter-organizations-${route.path}`;

  return useStorage(key, [] as Array<SelectOptionItem>);
}

export function useLocalStorageForFilterTeams() {
  const route = useRoute();
  const key = `filter-teams-${route.path}`;

  return useStorage(key, [] as Array<SelectOptionItem>);
}
