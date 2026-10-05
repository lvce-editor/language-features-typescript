import { expect, test } from '@jest/globals'
import * as CommandMap from '../src/parts/CommandMap/CommandMap.ts'

test('commandMap', () => {
  expect(typeof CommandMap.commandMap).toBe('object')
  expect(CommandMap.commandMap['Diagnostic.getFirstPerformanceTrace']).toEqual(expect.any(Function))
  expect(CommandMap.commandMap['Implementation.getImplementations']).toEqual(expect.any(Function))
})
