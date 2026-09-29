import { afterEach, expect, jest, test } from '@jest/globals'
import * as TypeScriptWorker from '../src/parts/TypeScriptWorker/TypeScriptWorker.ts'

const originalLaunchTypeScriptWorker = TypeScriptWorker.state.launchTypeScriptWorker

afterEach(() => {
  TypeScriptWorker.state.launchTypeScriptWorker = originalLaunchTypeScriptWorker
  TypeScriptWorker.state.rpcPromise = undefined
})

test('creates the worker lazily and shares the first request', async () => {
  const rpc = { invoke: jest.fn() }
  const { promise, resolve: resolveWorker } = Promise.withResolvers<typeof rpc>()
  const launchTypeScriptWorker = jest.fn(() => promise)
  TypeScriptWorker.state.launchTypeScriptWorker = launchTypeScriptWorker

  expect(launchTypeScriptWorker).not.toHaveBeenCalled()

  const firstRequest = TypeScriptWorker.getInstance()
  const secondRequest = TypeScriptWorker.getInstance()

  expect(launchTypeScriptWorker).toHaveBeenCalledTimes(1)
  resolveWorker(rpc)
  await expect(Promise.all([firstRequest, secondRequest])).resolves.toEqual([rpc, rpc])
})
