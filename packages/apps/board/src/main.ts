import type { UserModule } from "./types";
import { VueQueryPlugin } from "@tanstack/vue-query";

import FloatingVue from "floating-vue";

import { setupLayouts } from "virtual:generated-layouts";
import { ViteSSG } from "vite-ssg";
import { routes } from "vue-router/auto-routes";
// import Previewer from 'virtual:vue-component-preview'
import App from "./App.vue";

import "floating-vue/dist/style.css";
import "vue-search-select/dist/VueSearchSelect.css";
import "./styles/vue-search-select-dark.css";

import "@unocss/reset/tailwind.css";
import "@unocss/reset/tailwind-compat.css";
import "uno.css";

import "./styles/main.css";

// https://github.com/antfu/vite-ssg
export const createApp = ViteSSG(
  App,
  {
    routes: setupLayouts(routes),
    base: import.meta.env.BASE_URL,
  },
  (ctx) => {
    // install all modules under `modules/`
    Object.values(import.meta.glob<{ install: UserModule }>("./modules/*.ts", { eager: true }))
      .forEach(i => i.install?.(ctx));

    // ctx.app.use(Previewer)
    ctx.app.use(FloatingVue);
    ctx.app.use(VueQueryPlugin);
  },
);
