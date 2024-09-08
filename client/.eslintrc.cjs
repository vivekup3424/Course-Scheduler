/* required packages:
 * eslint
 * eslint-config-airbnb-base
 * eslint-config-prettier
 * eslint-plugin-import
 * eslint-plugin-react-hooks
 * eslint-config-airbnb-typescript
 * @typescript-eslint/eslint-plugin
 * @typescript-eslint/parser
 */

const eslintJsConfig = {
  extends: ["eslint:recommended", "airbnb-base", "prettier"],
  plugins: ["react-hooks", "import"],
  rules: {
    semi: 2,
    "prefer-template": "off",
    "no-console": "off",
    "no-undef": "off",
    "no-plusplus": "off",
    "no-bitwise": "off",
    "no-param-reassign": "off",
    "no-restricted-syntax": [
      "error",
      "ForInStatement",
      "LabeledStatement",
      "WithStatement",
    ],
    camelcase: "off",
    "no-use-before-define": "off",
    "no-void": "off",
    "no-continue": "off",
    "import/no-named-as-default": "off",
    "import/no-extraneous-dependencies": "off",
    "import/prefer-default-export": "off",
    "import/first": "error",
    "import/newline-after-import": "error",
    "import/no-duplicates": "error",
    "import/extensions": [
      "error",
      "ignorePackages",
      {
        js: "never",
        jsx: "never",
        ts: "never",
        tsx: "never",
      },
    ],
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "warn",
  },
  settings: {
    "import/resolver": {
      node: {
        extensions: [".js", ".jsx", ".ts", ".tsx"],
      },
    },
  },
};

const eslintTsConfig = {
  files: ["*.ts", "*.tsx"],
  extends: [
    "eslint:recommended",
    "airbnb-base",
    "plugin:@typescript-eslint/recommended",
    "airbnb-typescript/base",
    "prettier",
  ],
  plugins: ["@typescript-eslint", "react-hooks", "import"],
  parser: "@typescript-eslint/parser",
  parserOptions: {
    tsconfigRootDir: __dirname,
    ecmaVersion: "latest",
    project: ["./tsconfig.json"],
  },
  rules: {
    ...eslintJsConfig.rules,
    "@typescript-eslint/switch-exhaustiveness-check": "error",
    "@typescript-eslint/no-use-before-define": "off",
    "@typescript-eslint/no-var-requires": 0,
  },
  settings: eslintJsConfig.settings,
};

module.exports = {
  root: true,
  ...eslintJsConfig,
  overrides: [eslintTsConfig],
  ignorePatterns: ["vite.config.ts", "node_modules", "dist"],
};
