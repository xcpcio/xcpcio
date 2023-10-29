import {
  defineConfig,
  presetAttributify,
  presetIcons,
  presetTypography,
  presetUno,
  presetWebFonts,
  transformerDirectives,
  transformerVariantGroup,
} from "unocss";

export default defineConfig({
  theme: {
    colors: {
      primary: {
        50: "#eff6ff",
        100: "#dbeafe",
        200: "#bfdbfe",
        300: "#93c5fd",
        400: "#60a5fa",
        500: "#3b82f6",
        600: "#2563eb",
        700: "#1d4ed8",
        800: "#1e40af",
        900: "#1e3a8a",
        950: "#172554",
      },
      resolver: {
        ac: "var(--theme-resolver-ac)",
        wa: "var(--theme-resolver-wa)",
        pending: "var(--theme-resolver-pending)",
        untouched: "var(--theme-resolver-untouched)",
        selected: "var(--theme-resolver-selected)",
        bg: {
          zero: "var(--theme-resolver-bg-0)",
          one: "var(--theme-resolver-bg-1)",
        },
      },
    },
  },
  shortcuts: [
    [
      "btn",
      "px-4 py-1 rounded inline-block bg-teal-700 text-white cursor-pointer !outline-none hover:bg-teal-800 disabled:cursor-default disabled:bg-gray-600 disabled:opacity-50",
    ],
    [
      "icon-btn",
      "inline-block cursor-pointer select-none opacity-75 transition duration-200 ease-in-out hover:opacity-100 hover:text-teal-600",
    ],
  ],
  presets: [
    presetUno(),
    presetAttributify(),
    presetIcons({
      extraProperties: {
        "display": "inline-block",
        "height": "1.2em",
        "width": "1.2em",
        "vertical-align": "text-bottom",
      },
    }),
    presetTypography(),
    presetWebFonts({
      fonts: {
        // sans: "DM Sans",
        // serif: "DM Serif Display",
        // mono: "DM Mono",
      },
    }),
  ],
  transformers: [
    transformerDirectives(),
    transformerVariantGroup(),
  ],
  safelist: "prose m-auto text-left".split(" "),
  content: {
    filesystem: [
      "./node_modules/flowbite/**/*.js",
    ],
  },
});
