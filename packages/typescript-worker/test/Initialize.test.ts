import { test } from '@jest/globals'
import * as Initialize from '../src/parts/Initialize/Initialize.ts'

test('initialize', async () => {
  const path = ''
  await Initialize.initialize(path)
})
