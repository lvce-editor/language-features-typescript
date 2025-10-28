import { test, expect } from '@jest/globals'
import * as GetParentPath from '../src/parts/GetParentPath/GetParentPath.ts'

test('getParentPath - simple path', () => {
  const result = GetParentPath.getParentPath('a/b/c')
  expect(result).toBe('a/b')
})

test('getParentPath - single level', () => {
  const result = GetParentPath.getParentPath('a/b')
  expect(result).toBe('a')
})

test('getParentPath - no slashes', () => {
  const result = GetParentPath.getParentPath('filename')
  expect(result).toBe('')
})

test('getParentPath - empty string', () => {
  const result = GetParentPath.getParentPath('')
  expect(result).toBe('')
})

test('getParentPath - root path', () => {
  const result = GetParentPath.getParentPath('/')
  expect(result).toBe('')
})

test.skip('getParentPath - double slash', () => {
  const result = GetParentPath.getParentPath('a//b')
  expect(result).toBe('')
})

test('getParentPath - trailing slash', () => {
  const result = GetParentPath.getParentPath('test:///a/b/')
  expect(result).toBe('')
})

test('getParentPath - multiple slashes', () => {
  const result = GetParentPath.getParentPath('a/b/c/d')
  expect(result).toBe('a/b/c')
})

test('getParentPath - absolute path', () => {
  const result = GetParentPath.getParentPath('/home/user/file.txt')
  expect(result).toBe('/home/user')
})
