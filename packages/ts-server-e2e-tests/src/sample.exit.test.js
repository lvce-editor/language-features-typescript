import { TsServer } from 'ts-server'
import * as TsServerRequests from 'ts-server-requests'
import { createChild } from './_shared.js'

test.skip('sample.exit', async () => {
  const child = createChild()
  const server = TsServer.create(child)
  await TsServerRequests.configure(server, {})
  expect(await TsServerRequests.exit(server, {})).toBeUndefined()
})
