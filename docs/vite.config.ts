import UnoCSS from "unocss/vite";
import Components from "unplugin-vue-components/vite";
import { defineConfig } from "vite";

export default defineConfig({
  optimizeDeps: {
    exclude: [
      "vitepress",
    ],
  },
  server: {
    hmr: {
      overlay: false,
    },
  },
  plugins: [
    UnoCSS(),
    Components({
      dirs: [
        ".vitepress/theme/components",
      ],
      include: [
        /\.vue$/,
        /\.vue\?vue/,
        /\.md$/,
      ],
    }),
  ],
});
