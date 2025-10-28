import { test } from '@jest/globals'
import * as Initialize from '../src/parts/Initialize/Initialize.ts'

test.skip('initialize', async () => {
  const path = ''
  await Initialize.initialize(path, true)
})
