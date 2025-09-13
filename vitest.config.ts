import { defaultExclude, defineConfig } from "vitest/config";
import { alias } from "./alias";

export default defineConfig({
  resolve: {
    alias,
  },
  test: {
    testTimeout: 30_000,
    name: "unit",
    exclude: [...defaultExclude],
    projects: [
      "packages/libs/types/vitest.config.ts",
      "packages/libs/core/vitest.config.ts",
    ],
  },
});
