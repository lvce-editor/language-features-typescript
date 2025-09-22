import { test, expect } from '@jest/globals'
import * as JoinPath from '../src/parts/JoinPath/JoinPath.ts'

test('joinPath - basic path joining', () => {
  const result = JoinPath.joinPath('a', 'b', 'c')
  expect(result).toBe('a/b/c')
})

test('joinPath - single part', () => {
  const result = JoinPath.joinPath('single')
  expect(result).toBe('single')
})

test('joinPath - empty parts', () => {
  const result = JoinPath.joinPath('', 'b', '')
  expect(result).toBe('/b/')
})

test('joinPath - with relative paths starting with ./', () => {
  const result = JoinPath.joinPath('a', './b', 'c')
  expect(result).toBe('a/b/c')
})

test('joinPath - multiple relative paths', () => {
  const result = JoinPath.joinPath('./a', './b', './c')
  expect(result).toBe('a/b/c')
})

test('joinPath - mixed relative and absolute paths', () => {
  const result = JoinPath.joinPath('/absolute', './relative', 'normal')
  expect(result).toBe('/absolute/relative/normal')
})

test('joinPath - no parts', () => {
  const result = JoinPath.joinPath()
  expect(result).toBe('')
})

test('joinPath - with slashes in middle', () => {
  const result = JoinPath.joinPath('a/', '/b', 'c')
  expect(result).toBe('a///b/c')
})
