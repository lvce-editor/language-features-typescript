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
}

export const activate = async (): Promise<void> => {
  if (state.isActivated) {
    return
  }
  state.isActivated = true
  await activateExtensionApi()
  if ((await getPreference('typescript.useTs7')) === true) {
    for (const languageId of ['javascript', 'javascriptreact', 'typescript', 'typescriptreact']) {
      registerLanguageServer({
        argv: ['--lsp', '--stdio'],
        id: `typescript.ts7.${languageId}`,
        languageId,
        uri: 'lvce-language-server:typescript',
      })
    }
    return
  }
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

export const deactivate = async (): Promise<void> => {
  await DiskWatch.stopAll()
}
