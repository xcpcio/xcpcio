import type { RuntimeConfig } from "./types";

declare global {
  interface Window {
    RUNTIME_CONFIG?: RuntimeConfig;
    BASE_URL?: string;
    CDN_HOST: string;
    DATA_HOST: string;
    DATA_REGION: string;
    DEFAULT_LANG: string;
    REFETCH_INTERVAL: number;
    DATA_SOURCE?: string;
  }
}

// with vite-plugin-vue-markdown, markdown files can be treated as Vue components
declare module "*.md" {
  import type { DefineComponent } from "vue";

  const component: DefineComponent<object, object, any>;
  export default component;
}

export {};

declare module "*.vue" {
  import type { DefineComponent } from "vue";

  const component: DefineComponent<object, object, any>;
  export default component;
}
