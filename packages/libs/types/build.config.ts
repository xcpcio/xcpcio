import getGitRepoInfo from "git-repo-info";
import { defineBuildConfig } from "unbuild";
import packageJSON from "./package.json";

const gitRepoInfo = getGitRepoInfo();

export default defineBuildConfig({
  entries: ["src/index"],
  declaration: true,
  clean: true,
  rollup: {
    emitCJS: true,
  },
  replace: {
    "import.meta.vitest": "undefined",
    "import.meta.package.version": packageJSON.version,
    "import.meta.package.homepage": packageJSON.homepage,
    "import.meta.git.repo.abbreviatedSha": gitRepoInfo.abbreviatedSha,
  },
});
