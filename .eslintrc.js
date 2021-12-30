// @ts-check
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
}

/**
 * @type {import('eslint').Linter.Config}
 */
module.exports = {
  root: true,
  extends: ['@quitsmx'],
  ignorePatterns: ['/dist', '/patches'],
  env: {
    node: true,
    browser: true,
  },
  globals: {
    vim: 'readonly',
    print: 'readonly',
  },
  overrides: [
    {
      parserOptions: {
        project: './tsconfig.json',
        ecmaFeatures: {
          classStaticBlock: true,
        },
      },
      files: ['*.ts', '*.tsx'],
      extends: ['@quitsmx/eslint-config/ts-runtime'],
      rules,
    },
    {
      files: ['./*.js', 'scripts/**/*.js'],
      parserOptions: { sourceType: 'script' },
      extends: ['@quitsmx/eslint-config/node'],
      rules: {
        'node/no-unsupported-features/es-syntax': ['error', { ignores: ['modules'] }],
      },
    },
  ],
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
