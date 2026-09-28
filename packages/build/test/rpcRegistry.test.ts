import { expect, test } from '@jest/globals'
import { createRequire } from 'node:module'

test('the extension and API share the RPC registry initialized during activation', () => {
  const extensionRequire = createRequire(new URL('../../extension/package.json', import.meta.url))
  const apiRequire = createRequire(extensionRequire.resolve('@lvce-editor/api'))

  expect(extensionRequire.resolve('@lvce-editor/rpc-registry')).toBe(apiRequire.resolve('@lvce-editor/rpc-registry'))
})
