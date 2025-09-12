import type { Theme } from "vitepress";
import DefaultTheme from "vitepress/theme";
import { h } from "vue";
import BasicLayout from "./BasicLayout.vue";

import "./vars.css";
import "./overrides.css";
import "./rainbow.css";
import "uno.css";

export default {
  extends: DefaultTheme,
  Layout: () => {
    return h(BasicLayout);
  },
} satisfies Theme;

if (typeof window !== "undefined") {
  // detect browser, add to class for conditional styling
  const browser = navigator.userAgent.toLowerCase();
  if (browser.includes("chrome")) {
    document.documentElement.classList.add("browser-chrome");
  } else if (browser.includes("firefox")) {
    document.documentElement.classList.add("browser-firefox");
  } else if (browser.includes("safari")) {
    document.documentElement.classList.add("browser-safari");
  }
}
