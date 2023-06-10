import { defineBuildConfig } from "unbuild";
import packageJson from "./package.json";

export default defineBuildConfig({
  entries: ["src/index"],
  declaration: true,
  clean: true,
  rollup: {
    emitCJS: true,
  },
  replace: {
    "import.meta.vitest": "undefined",
    "import.meta.package.version": packageJson.version,
    "import.meta.package.homepage": packageJson.homepage,
  },
});
