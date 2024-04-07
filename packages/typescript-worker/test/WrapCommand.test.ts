import * as WrapCommand from '../src/parts/WrapCommand/WrapCommand.ts'
import { expect, test } from '@jest/globals'

test('wrapCommand', () => {
  const fn = () => {
    return 1
  }
  const wrapped = WrapCommand.wrapCommand(fn)
  expect(wrapped()).toBe(1)
})
