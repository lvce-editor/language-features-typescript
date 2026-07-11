import { activate as activateExtensionApi } from '@lvce-editor/api'
import * as Providers from '../Providers/Providers.ts'
import * as RegisterProviders from '../RegisterProviders/RegisterProviders.ts'

const state = {
  isActivated: false,
}

export const activate = async (): Promise<void> => {
  if (state.isActivated) {
    return
  }
  state.isActivated = true
  await activateExtensionApi()
  RegisterProviders.registerProviders(Object.values(Providers))
}

export const deactivate = (): void => {}
