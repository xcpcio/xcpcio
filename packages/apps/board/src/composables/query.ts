import { useRouteQuery } from "@vueuse/router";

export function getDataSourceUrl() {
  return useRouteQuery(
    "data-source",
    "",
    { transform: String },
  );
}

export function useRouteQueryForBattleOfGiants() {
  return useRouteQuery(
    "battle-of-giants",
    "",
    { transform: String },
  );
}
