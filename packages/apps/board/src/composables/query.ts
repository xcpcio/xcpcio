import { useRouteQuery } from "@vueuse/router";

export function getDataSourceUrl() {
  return useRouteQuery(
    "data-source",
    "",
    { transform: String },
  );
}
