import { testWorker } from '../src/testWorker.js'
import { test, expect } from '@jest/globals'

test('completion', async () => {
  const execMap = {}
  const worker = await testWorker({
    execMap,
  })
  const path = ''
  expect(await worker.execute('Initialize.initialize', path)).toEqual(undefined)
})
