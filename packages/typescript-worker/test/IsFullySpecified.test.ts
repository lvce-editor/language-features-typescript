import { test, expect } from '@jest/globals'
import * as IsFullySpecified from '../src/parts/IsFullySpecified/IsFullySpecified.ts'

test('isFullySpecified - empty string', () => {
  const result = IsFullySpecified.isFullySpecified('')
  expect(result).toBe(false)
})

test('isFullySpecified - dot', () => {
  const result = IsFullySpecified.isFullySpecified('.')
  expect(result).toBe(false)
})

test('isFullySpecified - dot slash', () => {
  const result = IsFullySpecified.isFullySpecified('./')
  expect(result).toBe(false)
})

test('isFullySpecified - valid module name', () => {
  const result = IsFullySpecified.isFullySpecified('react')
  expect(result).toBe(true)
})

test('isFullySpecified - scoped package', () => {
  const result = IsFullySpecified.isFullySpecified('@types/react')
  expect(result).toBe(true)
})

test('isFullySpecified - relative path', () => {
  const result = IsFullySpecified.isFullySpecified('./component')
  expect(result).toBe(true)
})

test('isFullySpecified - parent directory path', () => {
  const result = IsFullySpecified.isFullySpecified('../utils')
  expect(result).toBe(true)
})

test('isFullySpecified - single character', () => {
  const result = IsFullySpecified.isFullySpecified('a')
  expect(result).toBe(true)
})
