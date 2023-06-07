import * as GetTsServerArgv from './parts/GetTsServerArgv/GetTsServerArgv.js'
import * as GetTsServerPath from './parts/GetTsServerPath/GetTsServerPath.js'
import * as Providers from './parts/Providers/Providers.js'
import * as RegisterProviders from './parts/RegisterProviders/RegisterProviders.js'
import * as Rpc from './parts/Rpc/Rpc.js'

export const activate = async ({ path }) => {
  await Rpc.listen({ path })
  const tsServerPath = await GetTsServerPath.getTsServerPath()
  const options = {}
  const { argv, execArgv } = GetTsServerArgv.getTsServerArgv(options)
  await Rpc.invoke('Initialize.initialize', {
    tsServerPath,
    argv,
    execArgv,
  })
  RegisterProviders.registerProviders(Object.values(Providers))
}
