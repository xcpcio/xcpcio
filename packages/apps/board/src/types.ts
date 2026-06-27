import type { ViteSSGContext } from "vite-ssg";

export type UserModule = (ctx: ViteSSGContext) => void;

export type RuntimePageType = "index" | "contest" | "custom";

export type RuntimeComponent = "board" | "resolver" | "balloon" | "countdown";

export interface RuntimeConfig {
  pageType?: RuntimePageType;
  component?: RuntimeComponent;
  dataSource?: string;
  baseUrl?: string;
  cdnHost?: string;
  dataHost?: string;
  dataRegion?: string;
  defaultLang?: string;
  refetchInterval?: number;
}
