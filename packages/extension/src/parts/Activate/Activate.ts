import { activate as activateExtensionApi, registerCommand } from '@lvce-editor/api'
import * as Providers from '../Providers/Providers.ts'
import * as RegisterProviders from '../RegisterProviders/RegisterProviders.ts'
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
  RegisterProviders.registerProviders(Object.values(Providers))
}

export const deactivate = (): void => {}
