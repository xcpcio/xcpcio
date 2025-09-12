import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

function r(p: string) {
  return resolve(fileURLToPath(new URL(".", import.meta.url)), p);
}

export const aliasLibs: Record<string, string> = {
  "@xcpcio/types": r("./packages/libs/types/src/"),
  "@xcpcio/core": r("./packages/libs/core/src/"),
};

export const aliasApps: Record<string, string> = {
  "@board": r("./packages/apps/board/src/"),
};

export const alias: Record<string, string> = {
  ...aliasLibs,
  ...aliasApps,
};
