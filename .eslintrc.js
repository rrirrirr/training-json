module.exports = {
  extends: ["next/core-web-vitals"],
  rules: {
    "semi": ["error", "never"],
    "quotes": ["error", "double"],
    "comma-dangle": ["error", "always-multiline"],
    "indent": ["error", 2],
    "react/function-component-definition": [
      "error",
      { "namedComponents": "arrow-function" }
    ],
  },
}
