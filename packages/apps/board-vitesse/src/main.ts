import { ViteSSG } from "vite-ssg";
import { setupLayouts } from "virtual:generated-layouts";

import FloatingVue from "floating-vue";
import { VueQueryPlugin } from "@tanstack/vue-query";
import HighchartsVue from "highcharts-vue";

// import Previewer from 'virtual:vue-component-preview'
import App from "./App.vue";
import type { UserModule } from "./types";
import generatedRoutes from "~pages";

import "floating-vue/dist/style.css";
import "@unocss/reset/tailwind.css";
import "./styles/main.css";
import "uno.css";

const routes = setupLayouts(generatedRoutes);

// https://github.com/antfu/vite-ssg
export const createApp = ViteSSG(
  App,
  { routes, base: import.meta.env.BASE_URL },
  (ctx) => {
    // install all modules under `modules/`
    Object.values(import.meta.glob<{ install: UserModule }>("./modules/*.ts", { eager: true }))
      .forEach(i => i.install?.(ctx));

    // ctx.app.use(Previewer)
    ctx.app.use(FloatingVue);
    ctx.app.use(VueQueryPlugin);

    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    ctx.app.use(HighchartsVue);
  },
);
