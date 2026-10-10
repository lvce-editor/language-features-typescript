import { activate as activateExtensionApi, registerCommand } from '@lvce-editor/api'
import * as Providers from '../Providers/Providers.ts'
import * as RegisterProviders from '../RegisterProviders/RegisterProviders.ts'
import * as Rpc from '../Rpc/Rpc.ts'
import * as ShowPerformanceTrace from '../ShowPerformanceTrace/ShowPerformanceTrace.ts'

const state = {
  isActivated: false,
}

export const activate = async (): Promise<void> => {
  if (state.isActivated) {
    return
  }
  state.isActivated = true
  await activateExtensionApi()
  registerCommand({
    execute: ShowPerformanceTrace.showPerformanceTrace,
    id: 'typescript.showPerformanceTrace',
  })
  registerCommand({
    execute: (options?: { readonly waitForIdle?: boolean }) =>
      Rpc.invoke(options?.waitForIdle ? 'ProjectLifecycle.waitForIdle' : 'ProjectLifecycle.getStatistics'),
    id: 'typescript.getProjectCacheStatistics',
  })
  RegisterProviders.registerProviders(Object.values(Providers))
}

export const deactivate = (): void => {}
