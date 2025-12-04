export * from "./calc";
export * from "./color";
export * from "./dayjs";

export function normalizePath(path: string) {
  while (path.endsWith("/")) {
    path = path.slice(0, -1);
  }
  return `${path}/`;
}
