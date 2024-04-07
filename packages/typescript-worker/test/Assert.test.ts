import { test, expect } from '@jest/globals'
import * as Assert from '../src/parts/Assert/Assert.ts'

test('object', () => {
  expect(Assert.object({})).toBeUndefined()
})

test('object - error - function', () => {
  expect(() => Assert.object(() => {})).toThrow(new Error('expected value to be of type object'))
})

test('object - error - null', () => {
  expect(() => Assert.object(null)).toThrow(new Error('expected value to be of type object'))
})

test('object - error - symbol', () => {
  expect(() => Assert.object(Symbol())).toThrow(new Error('expected value to be of type object'))
})

test('object - error - undefined', () => {
  expect(() => Assert.object(undefined)).toThrow(new Error('expected value to be of type object'))
})

test('object - error - string', () => {
  expect(() => {
    Assert.object('')
  }).toThrow(new Error('expected value to be of type object'))
})

test('number', () => {
  expect(Assert.number(1)).toBeUndefined()
})

test('number - error', () => {
  expect(() => {
    Assert.number('')
  }).toThrow(new Error('expected value to be of type number'))
})

test('array', () => {
  expect(Assert.array([])).toBeUndefined()
})

test('array - error', () => {
  expect(() => {
    Assert.array('')
  }).toThrow(new Error('expected value to be of type array'))
})

test('string', () => {
  expect(Assert.string('')).toBeUndefined()
})

test('string - error', () => {
  expect(() => {
    Assert.string(1)
  }).toThrow(new Error('expected value to be of type string'))
})

test('boolean', () => {
  expect(Assert.boolean(true)).toBeUndefined()
})

test('boolean - error', () => {
  expect(() => {
    Assert.boolean(1)
  }).toThrow(new Error('expected value to be of type boolean'))
})
