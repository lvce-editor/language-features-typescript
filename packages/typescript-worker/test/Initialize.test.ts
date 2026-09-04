import { expect, test } from '@jest/globals'
import * as Initialize from '../src/parts/Initialize/Initialize.ts'

test.skip('initialize', async () => {
  const path = ''
  await expect(Initialize.initialize(path, true)).resolves.toBeUndefined()
})
