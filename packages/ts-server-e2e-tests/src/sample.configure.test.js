import { TsServer } from 'ts-server'
import * as TsServerRequests from 'ts-server-requests'
import { createChild } from './_shared.js'

test('sample.configure', async () => {
  const child = createChild()
  const server = TsServer.create(child)
  expect(await TsServerRequests.configure(server, {})).toBeUndefined()
})
