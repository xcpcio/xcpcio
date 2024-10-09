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
      "style/brace-style": "off",
      // "ts/brace-style": ["error", "1tbs"],
      "ts/consistent-type-imports": "off",
      "@unocss/order": "off",
      "@unocss/order-attributify": "off",
    },
  },
);
