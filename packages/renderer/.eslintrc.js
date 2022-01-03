// @ts-nocheck
// const config = require('@quitsmx/eslint-config')

/**
 * @type {import('eslint').Linter.RulesRecord}
 */
const rules = {
  // A temporary hack related to IDE not resolving correct package.json
  'import/no-extraneous-dependencies': 'off',
  // Since React 17 and typescript 4.1 you can safely disable the rule
  'react/react-in-jsx-scope': 'off',
  'sort-imports': 'off',
  'no-void': 'off',
  '@typescript-eslint/no-floating-promises': 'off',
  'vue/first-attribute-linebreak': 'off',
  'vue/html-self-closing': 'off',
  'vue/singleline-html-element-content-newline': 'off',
  'no-duplicate-imports': 0,

  'vue/max-attributes-per-line': [
    'error',
    {
      singleline: {
        max: 8,
      },
      multiline: {
        max: 8,
      },
    },
  ],
}

/**
 * @type {import('eslint').Linter.Config}
 */
module.exports = {
  env: {
    browser: true,
    node: false,
  },
  extends: [
    /** @see https://eslint.vuejs.org/rules/ */
    'plugin:vue/vue3-recommended',
  ],
  parserOptions: {
    parser: '@typescript-eslint/parser',
    ecmaVersion: 12,
    sourceType: 'module',
  },
  rules,
  settings: {
    'import/resolver': {
      // See https://github.com/benmosher/eslint-plugin-import/issues/1396#issuecomment-575727774 for line below
      node: {},
    },
    'import/parsers': {
      '@typescript-eslint/parser': ['.ts', '.tsx'],
    },
  },
}
