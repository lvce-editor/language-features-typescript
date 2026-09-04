import { expect, jest, test } from '@jest/globals'
import * as TypeScript from 'typescript'
import { parseTsconfig } from '../src/parts/ParseTsconfig/ParseTsconfig.ts'

test('parses comments supported by tsconfig files', () => {
  const readFile = jest.fn(() => {
    return `{
      "compilerOptions": {
        /* Bundler mode */
        "jsx": "react-jsx",
      },
    }`
  })

  expect(parseTsconfig('file:///workspace/tsconfig.json', readFile, TypeScript)).toEqual({
    compilerOptions: {
      jsx: 'react-jsx',
    },
  })
})

test('returns an empty config when parsing fails', () => {
  const readFile = jest.fn(() => '{')

  expect(parseTsconfig('file:///workspace/tsconfig.json', readFile, TypeScript)).toEqual({})
})
