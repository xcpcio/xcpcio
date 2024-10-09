const antfu = require("@antfu/eslint-config").default;

module.exports = antfu(
  {
    vue: true,
    html: true,
    yaml: true,
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

      "*.html",
    ],
  },
  {
    rules: {
      "curly": ["error", "all"],
      "no-lone-blocks": "off",
      "style/brace-style": ["error", "1tbs"],
      "@unocss/order": "off",
      "@unocss/order-attributify": "off",
    },
  },
);
