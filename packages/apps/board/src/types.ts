import type { ViteSSGContext } from "vite-ssg";

export type UserModule = (ctx: ViteSSGContext) => void;

export type RuntimePageType = "index" | "contest" | "custom";

export type RuntimeRoutingMode = "path" | "query";

export type RuntimeComponent = "board" | "resolver" | "balloon" | "countdown";

export interface RuntimeConfig {
  pageType?: RuntimePageType;
  indexPath?: string;
  routingMode?: RuntimeRoutingMode;
  component?: RuntimeComponent;
  dataSource?: string;
  baseUrl?: string;
  cdnHost?: string;
  dataHost?: string;
  dataRegion?: string;
  defaultLang?: string;
  localeUrls?: Record<string, string>;
  refetchInterval?: number;
}
