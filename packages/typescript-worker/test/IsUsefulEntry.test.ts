import { expect, test } from '@jest/globals'
import * as IsUsefulEntry from '../src/parts/IsUsefulEntry/IsUsefulEntry.ts'

test('IsUsefulEntry - useful', () => {
  const tsResult: any = {
    name: 'add',
  }
  expect(IsUsefulEntry.isUsefulEntry(tsResult)).toBe(true)
})

test('IsUsefulEntry - not useful', () => {
  const tsResult: any = {
    name: 'X509Certificate',
  }
  expect(IsUsefulEntry.isUsefulEntry(tsResult)).toBe(false)
})
