module.exports = {
  extends: [
    "@antfu",
  ],
  rules: {
    "semi": "off",
    "@typescript-eslint/semi": ["error", "always"],
    "@typescript-eslint/member-delimiter-style": "off",

    "quotes": "off",
    "@typescript-eslint/quotes": ["error", "double"],

    "curly": ["error", "all"],

    "no-lone-blocks": "off",

    "brace-style": "off",
    "@typescript-eslint/brace-style": ["error", "1tbs"],
  },
};
