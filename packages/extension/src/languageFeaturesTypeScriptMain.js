import * as GetTsServerPath from './parts/GetTsServerPath/GetTsServerPath.js'
import * as Providers from './parts/Providers/Providers.js'
import * as RegisterProviders from './parts/RegisterProviders/RegisterProviders.js'
import * as Rpc from './parts/Rpc/Rpc.js'

const toJsProvider = (provider) => {
  return {
    ...provider,
    languageId: 'javascript',
  }
}

export const activate = async ({ path }) => {
  await Rpc.listen({ path })
  const tsServerPath = await GetTsServerPath.getTsServerPath()
  await Rpc.invoke('Initialize.initialize', {
    tsServerPath,
  })
  RegisterProviders.registerProviders(Object.values(Providers))
  RegisterProviders.registerProviders(
    Object.values(Providers).map(toJsProvider)
  )
}
