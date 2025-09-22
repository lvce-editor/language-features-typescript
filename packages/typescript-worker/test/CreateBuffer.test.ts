import { test, expect } from '@jest/globals'
import * as CreateBuffer from '../src/parts/CreateBuffer/CreateBuffer.ts'

test('createBuffer - isolated true', () => {
  const result = CreateBuffer.createBuffer(true)
  expect(result).toBeInstanceOf(Int32Array)
  expect(result?.length).toBe(1)
  expect(result?.buffer).toBeInstanceOf(SharedArrayBuffer)
})

test('createBuffer - isolated false', () => {
  const result = CreateBuffer.createBuffer(false)
  expect(result).toBeUndefined()
})

test('createBuffer - isolated true - buffer properties', () => {
  const result = CreateBuffer.createBuffer(true)
  expect(result).toBeInstanceOf(Int32Array)
  expect(result?.buffer.byteLength).toBe(Int32Array.BYTES_PER_ELEMENT)
  expect(result?.length).toBe(1)
})

test('createBuffer - isolated true - buffer is writable', () => {
  const result = CreateBuffer.createBuffer(true)
  expect(result).toBeInstanceOf(Int32Array)
  if (result) {
    result[0] = 42
    expect(result[0]).toBe(42)
  }
})
