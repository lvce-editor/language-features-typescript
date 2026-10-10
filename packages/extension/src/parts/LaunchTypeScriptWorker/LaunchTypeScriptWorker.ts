import { createRpc, getPreference, type CreateRpcOptions } from '@lvce-editor/api'
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
  try {
    const idleMs = await getPreference('typescript.projectIdleTimeout')
    const warmProjects = await getPreference('typescript.maxIdleProjects')
    if (typeof idleMs === 'number') {
      await worker.invoke('ProjectLifecycle.configure', idleMs, typeof warmProjects === 'number' ? warmProjects : 0)
    }
  } catch {
    // Older hosts keep the conservative default without disabling language features.
  }
  return worker
}
