import { createRpc, type CreateRpcOptions } from '@lvce-editor/api'
import * as Command from '../Command/Command.ts'

type CreateRpc = (options: CreateRpcOptions) => Promise<Awaited<ReturnType<typeof createRpc>>>

export const state: { createRpc: CreateRpc } = {
  createRpc,
}

export const launchTypeScriptWorker = async (): Promise<any> => {
  const worker = await state.createRpc({
    commandMap: Command.commandMap,
    id: 'builtin.language-features-typescript.typescript-worker',
  })
  const typeScriptPath = ''
  const { crossOriginIsolated } = globalThis
  await worker.invoke('Initialize.initialize', typeScriptPath, crossOriginIsolated)
  return worker
}
