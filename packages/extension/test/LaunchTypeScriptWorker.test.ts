import type { CreateRpcOptions } from '@lvce-editor/api'
import { afterEach, expect, jest, test } from '@jest/globals'
import * as Command from '../src/parts/Command/Command.ts'
import * as LaunchTypeScriptWorker from '../src/parts/LaunchTypeScriptWorker/LaunchTypeScriptWorker.ts'

const originalCreateRpc = LaunchTypeScriptWorker.state.createRpc
const originalCrossOriginIsolated = globalThis.crossOriginIsolated

afterEach(() => {
  LaunchTypeScriptWorker.state.createRpc = originalCreateRpc
  Object.defineProperty(globalThis, 'crossOriginIsolated', {
    configurable: true,
    value: originalCrossOriginIsolated,
  })
})

test('creates the declared worker RPC and initializes it', async () => {
  const invoke = jest.fn(async (_method: string, ..._params: unknown[]) => undefined)
  const worker = { invoke }
  const createRpc = jest.fn(async (_options: CreateRpcOptions) => worker as any)
  LaunchTypeScriptWorker.state.createRpc = createRpc
  Object.defineProperty(globalThis, 'crossOriginIsolated', {
    configurable: true,
    value: true,
  })

  await LaunchTypeScriptWorker.launchTypeScriptWorker()

  expect(createRpc).toHaveBeenCalledWith({
    commandMap: Command.commandMap,
    id: 'builtin.language-features-typescript.typescript-worker',
  })
  expect(invoke).toHaveBeenCalledWith('Initialize.initialize', '', true)
})
