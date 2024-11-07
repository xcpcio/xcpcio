declare interface Window {
  CDN_HOST: string;
  DATA_HOST: string;
  DATA_REGION: string;
  DEFAULT_LANG: string;
  DATA_SOURCE?: string;
}

// with vite-plugin-vue-markdown, markdown files can be treated as Vue components
declare module "*.md" {
  import type { DefineComponent } from "vue";

  const component: DefineComponent<object, object, any>;
  export default component;
}

declare module "*.vue" {
  import type { DefineComponent } from "vue";

  const component: DefineComponent<object, object, any>;
  export default component;
}
