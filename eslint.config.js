import { defineConfig } from 'eslint/config'
import * as config from '@lvce-editor/eslint-config'

export default defineConfig([
  ...config.default,
  {
    files: ['**/*.ts'],
    rules: {
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/prefer-readonly-parameter-types': 'off',
    },
  },
  {
    files: ['packages/**/test/**/*.ts'],
    rules: {
      'jest/no-disabled-tests': 'off',
      'jest/no-restricted-jest-methods': 'off',
      'sonarjs/function-return-type': 'off',
      'sonarjs/no-identical-functions': 'off',
      'unicorn/consistent-function-scoping': 'off',
      'unicorn/no-global-object-property-assignment': 'off',
    },
  },
  {
    files: ['packages/e2e/**/*.ts'],
    rules: {
      'e2e/prefer-filesystem-set-files': 'off',
    },
  },
  {
    files: ['packages/{extension,typescript-worker}/src/parts/GetParameterListParts/GetParameterListParts.ts'],
    rules: {
      'sonarjs/cognitive-complexity': 'off',
      'unicorn/no-break-in-nested-loop': 'off',
    },
  },
])
