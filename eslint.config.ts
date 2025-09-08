import antfu from "@antfu/eslint-config";

export default antfu(
  {
    vue: true,
    yaml: true,
    unocss: true,
    formatters: true,
    pnpm: true,
    typescript: true,
    stylistic: {
      indent: 2,
      quotes: "double",
      semi: true,
    },
    ignores: [
      "dist/**/*",
      "cache/**/*",
      "node_modules/**/*",

      "data/**/*",
      "**/test-data/**/*",

      "python/**/*",

      "*.html",
    ],
  },
  {
    rules: {
      "curly": ["error", "all"],
      "no-lone-blocks": "off",
      "style/brace-style": ["error", "1tbs"],
      "unocss/order": "off",
      "unocss/order-attributify": "off",
    },
  },
);
