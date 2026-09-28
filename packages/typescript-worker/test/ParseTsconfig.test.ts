import { expect, jest, test } from '@jest/globals'
import * as TypeScript from 'typescript'
import { parseTsconfig } from '../src/parts/ParseTsconfig/ParseTsconfig.ts'

test('parses comments supported by tsconfig files', () => {
  const readFile = jest.fn((_uri: string) => {
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

test('returns an empty config for a missing path or an unreadable file', () => {
  const readFile = jest.fn((_uri: string) => {
    throw new Error('unavailable')
  })

  expect(parseTsconfig('', readFile, TypeScript)).toEqual({})
  expect(readFile).not.toHaveBeenCalled()
  expect(parseTsconfig('file:///workspace/tsconfig.json', readFile, TypeScript)).toEqual({})
  expect(readFile).toHaveBeenCalledWith('file:///workspace/tsconfig.json')
})
