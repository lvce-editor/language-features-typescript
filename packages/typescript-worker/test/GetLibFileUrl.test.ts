import { test, expect } from '@jest/globals'
import * as GetLibFileUrl from '../src/parts/GetLibFileUrl/GetLibFileUrl.ts'

test('getLibFileUrl - lib.d.ts', () => {
  const result = GetLibFileUrl.getLibFileUrl('lib.d.ts')
  expect(result).toContain('node_modules/typescript/lib/lib.d.ts')
  expect(result).toContain('file://')
})

test('getLibFileUrl - /lib.d.ts', () => {
  const result = GetLibFileUrl.getLibFileUrl('/lib.d.ts')
  expect(result).toContain('node_modules/typescript/lib/lib.d.ts')
  expect(result).toContain('file://')
})

test('getLibFileUrl - lib.es2015.d.ts', () => {
  const result = GetLibFileUrl.getLibFileUrl('lib.es2015.d.ts')
  expect(result).toContain('node_modules/typescript/lib/lib.es2015.d.ts')
  expect(result).toContain('file://')
})

test('getLibFileUrl - lib.dom.d.ts', () => {
  const result = GetLibFileUrl.getLibFileUrl('lib.dom.d.ts')
  expect(result).toContain('node_modules/typescript/lib/lib.dom.d.ts')
  expect(result).toContain('file://')
})

test('getLibFileUrl - with node_modules/@typescript/lib path', () => {
  const result = GetLibFileUrl.getLibFileUrl('node_modules/@typescript/lib/lib.d.ts')
  expect(result).toContain('node_modules/typescript/lib/lib.lib.d.d.ts')
  expect(result).toContain('file://')
})

test('getLibFileUrl - with node_modules/@typescript/lib path and dashes', () => {
  const result = GetLibFileUrl.getLibFileUrl('node_modules/@typescript/lib/lib-es2015.d.ts')
  expect(result).toContain('node_modules/typescript/lib/lib.lib.es2015.d.d.ts')
  expect(result).toContain('file://')
})

test('getLibFileUrl - with node_modules/@typescript/lib path and slashes', () => {
  const result = GetLibFileUrl.getLibFileUrl('node_modules/@typescript/lib/dom/lib.d.ts')
  expect(result).toContain('node_modules/typescript/lib/lib.dom.lib.d.d.ts')
  expect(result).toContain('file://')
})

test('getLibFileUrl - with node_modules/@typescript/lib path and .ts extension', () => {
  const result = GetLibFileUrl.getLibFileUrl('node_modules/@typescript/lib/lib-es2015.ts')
  expect(result).toContain('node_modules/typescript/lib/lib.lib.es2015.d.ts')
  expect(result).toContain('file://')
})

test('getLibFileUrl - path without node_modules/@typescript/lib', () => {
  const result = GetLibFileUrl.getLibFileUrl('some/other/path')
  expect(result).toBe('')
})

test('getLibFileUrl - empty string', () => {
  const result = GetLibFileUrl.getLibFileUrl('')
  expect(result).toBe('')
})
