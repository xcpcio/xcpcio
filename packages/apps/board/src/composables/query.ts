import { useRouteQueryWithoutParam } from "./useRouteQueryWithoutParam";

export function useQueryForSearch() {
  return useRouteQueryWithoutParam(
    "s",
    "",
    { transform: String },
  );
}

export function useQueryForDataSourceUrl() {
  return useRouteQueryWithoutParam(
    "data-source",
    "",
    { transform: String },
  );
}

export function useQueryForGroup() {
  return useRouteQueryWithoutParam(
    "group",
    "all",
    { transform: String },
  );
}

export function useQueryForReplayStartTime() {
  return useRouteQueryWithoutParam(
    "replay-start-time",
    "0",
    { transform: Number },
  );
}

export function useQueryForProgressRatio() {
  return useRouteQueryWithoutParam(
    "progress-ratio",
    -1,
    { transform: Number },
  );
}

export function useQueryForBattleOfGiants() {
  return useRouteQueryWithoutParam(
    "battle-of-giants",
    "",
    { transform: String },
  );
}

export function useQueryForComponent() {
  return useRouteQueryWithoutParam(
    "component",
    "board",
    { transform: String },
  );
}
