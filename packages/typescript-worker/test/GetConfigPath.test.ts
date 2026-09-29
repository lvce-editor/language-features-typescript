import { expect, jest, test } from '@jest/globals'
import { getConfigPath } from '../src/parts/GetConfigPath/GetConfigPath.ts'

test('finds the closest config file while walking up from the document', () => {
  const exists = jest.fn((uri: string) => uri === '/workspace/tsconfig.json')

  expect(getConfigPath('/workspace/src/main.ts', 'tsconfig.json', exists)).toBe('/workspace/tsconfig.json')
  expect(exists).toHaveBeenCalledWith('/workspace/src/tsconfig.json')
  expect(exists).toHaveBeenCalledWith('/workspace/tsconfig.json')
})

test('returns an empty path when no parent can contain a config file', () => {
  const exists = jest.fn(() => false)

  expect(getConfigPath('main.ts', 'tsconfig.json', exists)).toBe('')
  expect(exists).not.toHaveBeenCalled()
})
