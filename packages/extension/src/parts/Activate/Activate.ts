import {
  activate as activateExtensionApi,
  getPreference,
  registerCommand,
  registerLanguageServer,
} from '@lvce-editor/api'
import * as DiskWatch from '../DiskWatch/DiskWatch.ts'
import * as Providers from '../Providers/Providers.ts'
import * as RegisterProviders from '../RegisterProviders/RegisterProviders.ts'
import * as Rpc from '../Rpc/Rpc.ts'
import * as ShowPerformanceTrace from '../ShowPerformanceTrace/ShowPerformanceTrace.ts'

const state = {
  isActivated: false,
  native: false,
}
const activation = Promise.withResolvers<void>()

const requireWorkerBackend = async (): Promise<void> => {
  await activation.promise
  if (state.native) {
    throw new Error('This command requires the TypeScript web-worker backend')
  }
}

export const activate = async (): Promise<void> => {
  if (state.isActivated) {
    return activation.promise
  }
  state.isActivated = true
  // Observe rejection even when no host request is awaiting readiness yet.
  void activation.promise.catch(() => {})
  // Install dispatch before the API creates its initial RPC command map. The
  // preference round trip must not expose a partially registered extension.
  registerCommand({ execute: () => activation.promise, id: 'typescript.awaitActivation' })
  const workerCommands = [
    registerCommand({
      execute: async (...args: Parameters<typeof ShowPerformanceTrace.showPerformanceTrace>) => {
        await requireWorkerBackend()
        return ShowPerformanceTrace.showPerformanceTrace(...args)
      },
      id: 'typescript.showPerformanceTrace',
    }),
    registerCommand({
      execute: async (options?: { readonly waitForIdle?: boolean }) => {
        await requireWorkerBackend()
        return Rpc.invoke(options?.waitForIdle ? 'ProjectLifecycle.waitForIdle' : 'ProjectLifecycle.getStatistics')
      },
      id: 'typescript.getProjectCacheStatistics',
    }),
  ]
  const workerProviders = RegisterProviders.registerProviders(Object.values(Providers), requireWorkerBackend)
  const nativeServers = ['javascript', 'javascriptreact', 'typescript', 'typescriptreact'].map((languageId) =>
    registerLanguageServer({
      argv: ['--lsp', '--stdio'],
      id: `typescript.ts7.${languageId}`,
      languageId,
      uri: 'lvce-language-server:typescript',
    }),
  )
  try {
    await activateExtensionApi()
    state.native = (await getPreference('typescript.useTs7')) === true
    if (state.native) {
      for (const registration of [...workerCommands, ...workerProviders]) registration.dispose()
    } else {
      for (const server of nativeServers) server.dispose()
    }
    activation.resolve()
  } catch (error) {
    activation.reject(error)
    throw error
  }
}

export const deactivate = async (): Promise<void> => {
  await DiskWatch.stopAll()
}
