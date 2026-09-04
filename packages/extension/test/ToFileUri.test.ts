import { expect, test } from '@jest/globals'
import { toFileUri } from '../src/parts/ToFileUri/ToFileUri.ts'

test('converts an absolute posix path to a file uri', () => {
  expect(toFileUri('/home/user/project/tsconfig.json')).toBe('file:///home/user/project/tsconfig.json')
})

test('converts an absolute windows path to a file uri', () => {
  expect(toFileUri('C:\\Users\\user\\project\\tsconfig.json')).toBe('file:///C:/Users/user/project/tsconfig.json')
})

test('converts a windows network path to a file uri', () => {
  expect(toFileUri('\\\\server\\share\\project\\tsconfig.json')).toBe('file://server/share/project/tsconfig.json')
})

test('preserves an existing file uri', () => {
  expect(toFileUri('file:///home/user/project/tsconfig.json')).toBe('file:///home/user/project/tsconfig.json')
})

test('preserves other uris', () => {
  expect(toFileUri('memfs:///project/tsconfig.json')).toBe('memfs:///project/tsconfig.json')
})

test('preserves relative paths', () => {
  expect(toFileUri('project/tsconfig.json')).toBe('project/tsconfig.json')
})
